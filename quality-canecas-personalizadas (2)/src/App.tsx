/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Coffee,
  Music,
  Film,
  Tv,
  Quote,
  TrendingUp,
  Compass,
  Gamepad2,
  Sparkles,
  Users,
  Heart,
  Briefcase,
  Car,
  Trophy,
  Moon,
  Dog,
  Flower,
  Star,
  Gift,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Lock,
  CreditCard,
  Truck,
  Award,
  Upload,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Instagram,
  Send,
  Sparkle,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Copy,
  MessageSquare
} from 'lucide-react';
import {
  THEME_COLLECTIONS,
  SPECIAL_DATES,
  USER_REVIEWS,
  MUG_PRODUCTS,
  ThemeCollection
} from './types';
import { motion, AnimatePresence } from 'motion/react';

// Import banner images for assets bundling
import heroImperialMug from './assets/images/hero_imperial_mug_1779561791805.png';
import heroGiftMugs from './assets/images/hero_gift_mugs_1779561825480.png';
import heroCreativeMugs from './assets/images/hero_creative_mugs_1779561843171.png';

// Map icon names to dynamic Lucide elements
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee, Music, Film, Tv, Quote, TrendingUp, Compass, Gamepad2, Sparkles,
  Users, Heart, Briefcase, Car, Trophy, Moon, Dog, Flower, Star, Gift, Camera
};

// Custom prices for specific products (fallback is default R$ 45,90)
const PRODUCT_PRICES: Record<string, number> = {
  'caneca maezona': 5.00,
};

export const getProductPrice = (title: string | null): number => {
  if (!title) return 45.90;
  const nom = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (nom.includes("maezona")) {
    return 5.00;
  }
  return 45.90;
};

export default function App() {
  // Mobile Nav toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active hero carousel slide
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Swipe gesture support for main banner
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (diff > minSwipeDistance) {
      // Swiped left -> next slide
      setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
    } else if (diff < -minSwipeDistance) {
      // Swiped right -> previous slide
      setCurrentHeroSlide((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));
    }
    setTouchStart(null);
  };

  // Active testimonial slide
  const [currentReview, setCurrentReview] = useState(0);

  // Active special dates slide for mobile carousel
  const [currentDateSlide, setCurrentDateSlide] = useState(0);

  // Active mug slide for mobile carousel
  const [currentMugSlide, setCurrentMugSlide] = useState(0);

  // Active mug slide for desktop carousel
  const [currentDesktopMugSlide, setCurrentDesktopMugSlide] = useState(0);

  // Active catalog page (2x2 grid carousel)
  const [currentCatalogPage, setCurrentCatalogPage] = useState(0);

  // Active benefit slide for mobile layout carousel
  const [currentBenefitSlide, setCurrentBenefitSlide] = useState(0);

  // Position tracker for touch swipes on the success gallery
  const [catalogTouchStart, setCatalogTouchStart] = useState<number | null>(null);

  // Selected gallery index for Zoom Lightbox Modal
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);

  // Estados para a nova página interativa de detalhes e descrição do produto
  const [productQty, setProductQty] = useState(1);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [customPhotoName, setCustomPhotoName] = useState<string>('');
  const [customText, setCustomText] = useState('');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Sistema de carrinho / Escolhas acumuladas para o fluxo de 3 páginas
  const [cartItems, setCartItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('quality_mugs_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [forceFreeShipping, setForceFreeShipping] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('quality_mugs_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Selected available mug index for Zoom Lightbox Modal
  const [selectedAvailableMugIndex, setSelectedAvailableMugIndex] = useState<number | null>(null);

  // Active payment link for the custom nested browser viewport
  const [activeCheckoutLink, setActiveCheckoutLink] = useState<string | null>(null);
  const [activeCheckoutName, setActiveCheckoutName] = useState<string | null>(null);
  const [activeCheckoutImage, setActiveCheckoutImage] = useState<string | null>(null);
  const [activeCheckoutIframeLoading, setActiveCheckoutIframeLoading] = useState(true);

  // Estados do Checkout Transparente (Checkout Próprio integrado de Alta Performance)
  const [activeTab, setActiveTab] = useState<'home' | 'detalhes' | 'carrinho' | 'checkout' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'home' || tab === 'detalhes' || tab === 'carrinho' || tab === 'checkout' || tab === 'admin') {
        return tab as 'home' | 'detalhes' | 'carrinho' | 'checkout' | 'admin';
      }
    }
    return 'home';
  });
  const [checkoutMode, setCheckoutMode] = useState<'transparente' | 'infinitepay'>('transparente');
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Identificação, 2 = Entrega & Frete, 3 = Pagamento
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [isAdminError, setIsAdminError] = useState('');
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'pushin_pay' | 'asaas_api'>('asaas_api');
  const [asaasApiKey, setAsaasApiKey] = useState('');
  const [asaasSandbox, setAsaasSandbox] = useState(true);
  const [orderBumpSelected, setOrderBumpSelected] = useState(false);
  const [orderBumpGiftSelected, setOrderBumpGiftSelected] = useState(false);
  const [orderBumpPrioritySelected, setOrderBumpPrioritySelected] = useState(false);
  const [urgencyTimeLeft, setUrgencyTimeLeft] = useState(900); // 15 minutos
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellAccepted, setUpsellAccepted] = useState(false);

  const [custName, setCustName] = useState('');
  const [custCpf, setCustCpf] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custCep, setCustCep] = useState('');
  const [custStreet, setCustStreet] = useState('');
  const [custNumber, setCustNumber] = useState('');
  const [custComplement, setCustComplement] = useState('');
  const [custNeighborhood, setCustNeighborhood] = useState('');
  const [custCity, setCustCity] = useState('');
  const [custState, setCustState] = useState('');
  const [custSelectedShipping, setCustSelectedShipping] = useState<'pac' | 'sedex'>('pac');
  const [custPaymentMethod, setCustPaymentMethod] = useState<'pix_pushin' | 'card' | 'boleto' | 'infinitepay'>('pix_pushin');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);

  // Estados dinâmicos integrados de faturamento real
  const [shippingPacPrice, setShippingPacPrice] = useState(14.90);
  const [shippingSedexPrice, setShippingSedexPrice] = useState(22.50);
  const [shippingPacDays, setShippingPacDays] = useState(7);
  const [shippingSedexDays, setShippingSedexDays] = useState(3);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [showEmbeddedBoletoModal, setShowEmbeddedBoletoModal] = useState(false);

  // Módulo de Conversão: Exit Intent Popup & Cupom "Última Chance"
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasSeenExitIntent, setHasSeenExitIntent] = useState(false);
  const [exitIntentDiscountApplied, setExitIntentDiscountApplied] = useState(false);
  const [exitIntentSecondsLeft, setExitIntentSecondsLeft] = useState(300); // 5 minutos (300 segundos)
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [backendConfig, setBackendConfig] = useState<{
    hasAsaas: boolean;
    isAsaasSandbox: boolean;
    hasMelhorEnvio: boolean;
    isMelhorEnvioSandbox: boolean;
  } | null>(null);

  // Cálculos dinâmicos em tempo real para o carrinho acumulável do fluxo de 3 páginas
  const isCartActive = cartItems && cartItems.length > 0;

  const baseMugsSubtotal = isCartActive
    ? cartItems.reduce((acc: number, item: any) => acc + ((item.price || getProductPrice(item.title)) * item.qty), 0)
    : (getProductPrice(activeCheckoutName) * productQty);

  const totalMugsCount = isCartActive
    ? cartItems.reduce((acc: number, item: any) => acc + item.qty, 0)
    : productQty;

  const bump1Price = orderBumpSelected ? 12.90 : 0;
  const bump2Price = orderBumpGiftSelected ? 9.90 : 0; // Caixa Presente Luxo
  const bump3Price = orderBumpPrioritySelected ? 6.95 : 0; // Envio prioritário
  const upsellPrice = upsellAccepted ? 19.90 : 0;

  const preDiscountSubtotal = baseMugsSubtotal + bump1Price + bump2Price + bump3Price + upsellPrice;

  const hasMaezona = isCartActive
    ? cartItems.some((item: any) => (item.title || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("maezona"))
    : (activeCheckoutName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("maezona");

  const isFreteGratis = totalMugsCount >= 2 || forceFreeShipping || hasMaezona;
  const shippingCost = isFreteGratis ? 0 : (custSelectedShipping === 'pac' ? shippingPacPrice : shippingSedexPrice);

  const discountAmount = exitIntentDiscountApplied ? (preDiscountSubtotal * 0.1) : 0;
  const finalAmountValue = (preDiscountSubtotal - discountAmount) + shippingCost;

  const fetchBackendConfig = async () => {
    try {
      const res = await fetch('/api/credentials-status');
      if (res.ok) {
        const data = await res.json();
        setBackendConfig(data);
      }
    } catch (e) {
      console.warn("Failed to retrieve backend credentials status:", e);
    }
  };

  useEffect(() => {
    fetchBackendConfig();
  }, [activeCheckoutName]);

  // Bloqueador de rolagem do body quando o Checkout estiver ativo
  useEffect(() => {
    if (activeCheckoutLink !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeCheckoutLink]);

  // Efeito de Detecção de Saída (Exit Intent) na Tela Inicial (Home Page) - RESTRITO A COMPUTADORES (PC/MOUSE)
  useEffect(() => {
    // Apenas ativa se o checkout NÃO estiver aberto, se não finalizou pedido e se não viu o popup ainda
    if (activeCheckoutLink !== null || isOrderPlaced || hasSeenExitIntent) return;

    // Detectar cursor do mouse saindo do topo da página (Exclusivo para Computadores/Desktop)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 20) {
        setShowExitIntent(true);
        setHasSeenExitIntent(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [activeCheckoutLink, isOrderPlaced, hasSeenExitIntent]);

  // Contador Regressivo da Janela de Cupom "Última Chance"
  useEffect(() => {
    if (!showExitIntent || exitIntentSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setExitIntentSecondsLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showExitIntent, exitIntentSecondsLeft]);

  // Função para criar faturamento real via gateway Asaas / Pushin no nosso servidor
  const finalizeOrderPayment = async (useUpsell: boolean) => {
    setIsOrderLoading(true);
    try {
      const selectedShippingPrice = shippingCost;
      const originalSubtotal = preDiscountSubtotal;
      const finalAmount = finalAmountValue;
      
      let description = '';
      if (isCartActive) {
        description = cartItems.map((item: any) => `${item.qty}x ${item.title}${item.customPhotoName ? ' (Anexo: ' + item.customPhotoName + ')' : ''}`).join(', ') + 
                      `${orderBumpSelected ? ' + Porta-Copo Premium' : ''}${useUpsell ? ' + Segunda Caneca (Upsell)' : ''}${orderBumpGiftSelected ? ' + Caixa Presente Luxo' : ''}${orderBumpPrioritySelected ? ' + Envio Express Prioritário' : ''}${exitIntentDiscountApplied ? ' [Cupom 10% Aplicado]' : ''}`;
      } else {
        const customString = `${customPhotoName ? ' [Foto: ' + customPhotoName + ']' : ''}${customText ? ' [Texto: ' + customText + ']' : ''}`;
        description = `Caneca Quality: ${productQty}x ${activeCheckoutName || 'Personalizada'}${customString}${orderBumpSelected ? ' + Porta-Copo Premium' : ''}${useUpsell ? ' + Segunda Caneca (Upsell)' : ''}${orderBumpGiftSelected ? ' + Caixa Presente Luxo' : ''}${orderBumpPrioritySelected ? ' + Envio Express Prioritário' : ''}${exitIntentDiscountApplied ? ' [Cupom 10% Aplicado]' : ''}`;
      }

      const res = await fetch('/api/create-asass-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: custName,
          cpf: custCpf,
          email: custEmail,
          paymentMethod: custPaymentMethod,
          amount: finalAmount,
          description
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPaymentResponse(data);
        setIsOrderPlaced(true);
        captureLeadToServer('Completo', finalAmount);
      } else {
        console.error('Falha ao processar pagamento no servidor, gerando fallback local');
        setIsOrderPlaced(true);
        captureLeadToServer('Completo', finalAmount);
      }
    } catch (err) {
      console.error('Erro de rede ou ao finalizar pagamento:', err);
      setIsOrderPlaced(true); // Garante a continuidade visual da experiência em fallback inteligente
      captureLeadToServer('Completo', finalAmountValue);
    } finally {
      setIsOrderLoading(false);
    }
  };

  // Temporizador para o Pix Dinâmico da Pushin Pay (15 minutos em segundos)
  const [pixTimeLeft, setPixTimeLeft] = useState(900);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOrderPlaced && custPaymentMethod === 'pix_pushin') {
      interval = setInterval(() => {
        setPixTimeLeft((prev) => (prev > 0 ? prev - 1 : 900));
      }, 1000);
    } else {
      setPixTimeLeft(900);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOrderPlaced, custPaymentMethod]);

  const formatPixTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Temporizador Geral de Urgência de 15 minutos do Checkout Premium Estilo Kiwify
  useEffect(() => {
    const timer = setInterval(() => {
      setUrgencyTimeLeft((prev) => (prev > 1 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUrgencyTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cartão de crédito states para simulação real de checkout
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [showValidationChecked, setShowValidationChecked] = useState(false);

  // Selected success topic for tab filtering
  const [selectedSuccessTopic, setSelectedSuccessTopic] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const buyInteractive = (item: { title: string; image: string; originalIndex: number }) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(i => i.title === item.title);
      let updated;
      if (existingIdx > -1) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: updated[existingIdx].qty + 1
        };
      } else {
        updated = [...prev, {
          title: item.title,
          image: item.image,
          price: getProductPrice(item.title),
          qty: 1
        }];
      }
      return updated;
    });
    setActiveTab('carrinho');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load saved InfinitePay links from localStorage (if any)
  const [savedPayLinks, setSavedPayLinks] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('quality_mugs_pay_links_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // State to manage the config password or unlock state for editing links
  const [isLojistaUnlocked, setIsLojistaUnlocked] = useState(false);
  const [lojistaPassword, setLojistaPassword] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [temporaryLinkLabel, setTemporaryLinkLabel] = useState('');

  // Function to save a specific link
  const updatePayLink = (mugTitle: string, link: string) => {
    const updated = { ...savedPayLinks, [mugTitle]: link };
    setSavedPayLinks(updated);
    try {
      localStorage.setItem('quality_mugs_pay_links_v2', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to resolve link safely
  const getMugPayLink = (title: string, fallbackLink: string = '') => {
    return savedPayLinks[title] || fallbackLink || '';
  };

  // Function to load administrative orders from server-side JSON DB
  const loadAdminOrders = async () => {
    setIsAdminLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?password=${adminPassword}`);
      if (res.ok) {
        const data = await res.json();
        setAdminOrders(data);
        setIsAdminAuthenticated(true);
        setIsAdminError('');
      } else {
        const err = await res.json();
        setIsAdminError(err.error || 'Senha incorreta!');
      }
    } catch (e: any) {
      setIsAdminError('Erro ao conectar com o servidor para carregar clientes.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  // Function to register order/lead securely in background
  const captureLeadToServer = async (status: string, overrideAmount?: number) => {
    if (!custName || !custPhone) return;
    try {
      // Create a readable list of items
      let rawItems = "";
      let isCartActive = true; 
      if (activeCheckoutName && activeCheckoutName !== 'Coleção de Canecas Escolhidas') {
        isCartActive = false;
      }
      
      if (isCartActive) {
        rawItems = cartItems.map(i => `${i.title} (x${i.qty || 1})`).join(', ');
      } else {
        rawItems = `${productQty}x ${activeCheckoutName || 'Caneca'}`;
      }

      // Calculate checkout amount
      const devShipping = shippingCost;
      const finalValForServer = overrideAmount || finalAmountValue;

      const response = await fetch('/api/save-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: custName,
          phone: custPhone.replace(/\D/g, ""),
          email: custEmail,
          cpf: custCpf,
          cep: custCep,
          street: custStreet,
          number: custNumber,
          neighborhood: custNeighborhood,
          city: custCity,
          state: custState,
          items: rawItems,
          amount: finalValForServer,
          paymentMethod: custPaymentMethod || 'pix_pushin',
          shippingCost: devShipping,
          shippingName: custSelectedShipping === 'pac' ? 'Correios PAC' : 'Correios SEDEX',
          status: status
        })
      });

      if (!response.ok) {
        console.warn("[CRM Lead Capture Issue] Server responded with error status");
      }
    } catch (err) {
      console.warn("[CRM Lead Capture Connection Failed]", err);
    }
  };

  // --- FUNÇÕES DE MÁSCARA E SIMULAÇÃO PARA O CHECKOUT TRANSPARENTE ---
  const handleCpfChange = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    let masked = numbers;
    
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      if (numbers.length > 3) {
        masked = `${numbers.substring(0, 3)}.${numbers.substring(3)}`;
      }
      if (numbers.length > 6) {
        masked = `${masked.substring(0, 7)}.${numbers.substring(6)}`;
      }
      if (numbers.length > 9) {
        masked = `${masked.substring(0, 11)}-${numbers.substring(9, 11)}`;
      }
      setCustCpf(masked.substring(0, 14));
    } else {
      // CNPJ: 00.000.000/0000-00
      if (numbers.length > 2) {
        masked = `${numbers.substring(0, 2)}.${numbers.substring(2)}`;
      }
      if (numbers.length > 5) {
        masked = `${masked.substring(0, 6)}.${numbers.substring(5)}`;
      }
      if (numbers.length > 8) {
        masked = `${masked.substring(0, 10)}/${numbers.substring(8)}`;
      }
      if (numbers.length > 12) {
        masked = `${masked.substring(0, 15)}-${numbers.substring(12, 14)}`;
      }
      setCustCpf(masked.substring(0, 18));
    }
  };

  const handlePhoneChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let masked = numbers;
    if (numbers.length > 0) {
      masked = `(${numbers.substring(0, 2)}`;
    }
    if (numbers.length > 2) {
      masked = `${masked}) ${numbers.substring(2)}`;
    }
    if (numbers.length > 7) {
      masked = `${masked.substring(0, 10)}-${numbers.substring(7, 11)}`;
    }
    setCustPhone(masked.substring(0, 15)); // (00) 00000-0000
  };

  const handleCepChange = async (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let masked = numbers;
    if (numbers.length > 5) {
      masked = `${numbers.substring(0, 5)}-${numbers.substring(5, 8)}`;
    }
    const finalCep = masked.substring(0, 9);
    setCustCep(finalCep);

    // Se o CEP digitado estiver completo (8 números / formato 00000-000)
    if (numbers.length === 8) {
      setIsCepLoading(true);
      try {
        // 1. Chamada Real ao ViaCEP para autopreencher endereço
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
        if (viaCepResponse.ok) {
          const viaCepData = await viaCepResponse.json();
          if (!viaCepData.erro) {
            setCustStreet(viaCepData.logradouro || '');
            setCustNeighborhood(viaCepData.bairro || '');
            setCustCity(viaCepData.localidade || '');
            setCustState(viaCepData.uf || '');
          }
        }

        // 2. Chamada Real ao nosso servidor para Calcular o Frete via Melhor Envio
        const freightResponse = await fetch('/api/calculate-freight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cepDestino: numbers })
        });
        
        if (freightResponse.ok) {
          const freightData = await freightResponse.json();
          if (freightData.success && freightData.rates) {
            const pacRate = freightData.rates.find((r: any) => r.id === 'pac' || r.name.toLowerCase().includes('pac'));
            const sedexRate = freightData.rates.find((r: any) => r.id === 'sedex' || r.name.toLowerCase().includes('sedex'));
            
            if (pacRate) {
              setShippingPacPrice(pacRate.price);
              setShippingPacDays(pacRate.delivery_time);
            }
            if (sedexRate) {
              setShippingSedexPrice(sedexRate.price);
              setShippingSedexDays(sedexRate.delivery_time);
            }
          }
        }
      } catch (err) {
        console.error('Erro de rede ou cálculo de frete:', err);
      } finally {
        setIsCepLoading(false);
      }
    }
  };

  const handleCardNumberChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const parts = [];
    for (let i = 0; i < numbers.length; i += 4) {
      parts.push(numbers.substring(i, i + 4));
    }
    setCardNumber(parts.join(' ').substring(0, 19)); // 0000 0000 0000 0000
  };

  const handleCardExpiryChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let masked = numbers;
    if (numbers.length > 2) {
      masked = `${numbers.substring(0, 2)}/${numbers.substring(2, 4)}`;
    }
    setCardExpiry(masked.substring(0, 5)); // MM/AA
  };

  const handleCardCvvChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    setCardCvv(numbers.substring(0, 4));
  };

  // Metallic mugs carousel rotation offset state
  const [metallicOffset, setMetallicOffset] = useState(0);

  // Auto-circulate metallic mugs every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setMetallicOffset((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const metallicItems = [
    {
      index: 3,
      title: 'Caneca Cromada Rosa',
      image: 'https://i.postimg.cc/PrK6pPWc/caneca-rosa-cromada-personalizada.webp',
      label: 'Ver Detalhes Caneca Cromada Rosa',
    },
    {
      index: 2,
      title: 'Caneca Dourada Metalizada',
      image: 'https://i.postimg.cc/qqs5ZwC1/caneca-dourada-metalizada-personalizada.webp',
      label: 'Ver Detalhes Caneca Dourada Metalizada',
    },
    {
      index: 4,
      title: 'Caneca Cromada Prata',
      image: 'https://i.postimg.cc/kXZbpCqS/caneca-cromada-personalizada.webp',
      label: 'Ver Detalhes Caneca Cromada Prata',
    },
  ];

  // Ref for the success catalog touch slider
  const catalogScrollRef = useRef<HTMLDivElement>(null);

  // Ref for Best Sellers (Mais vendidos) carousel
  const maisVendidosRef = useRef<HTMLDivElement>(null);

  // Ref and state for Featured (Destaques) carousel
  const destaquesScrollRef = useRef<HTMLDivElement>(null);
  const [currentDestaqueIndicatorIndex, setCurrentDestaqueIndicatorIndex] = useState(1);

  // Ref and helper to scroll the Category highlights row
  const highlightsScrollRef = useRef<HTMLDivElement>(null);
  const scrollHighlights = (direction: 'left' | 'right') => {
    if (highlightsScrollRef.current) {
      const container = highlightsScrollRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const tolerance = 25; // tolerance for element scroll positions and fractional zoom levels

      if (direction === 'right') {
        const isNearEnd = container.scrollLeft >= maxScroll - tolerance;
        if (isNearEnd) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: 250, behavior: 'smooth' });
        }
      } else {
        const isNearStart = container.scrollLeft <= tolerance;
        if (isNearStart) {
          container.scrollTo({ left: maxScroll, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: -250, behavior: 'smooth' });
        }
      }
    }
  };

  const scrollMaisVendidos = (direction: 'left' | 'right') => {
    if (maisVendidosRef.current) {
      const container = maisVendidosRef.current;
      const firstChild = container.querySelector('.snap-start');
      const itemWidth = firstChild ? firstChild.clientWidth : 200;
      // Scroll by 2 items at a time
      const scrollAmount = direction === 'left' ? -itemWidth * 2 : itemWidth * 2;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollDestaques = (direction: 'left' | 'right') => {
    if (destaquesScrollRef.current) {
      const container = destaquesScrollRef.current;
      const firstChild = container.querySelector('.snap-start');
      const itemWidth = firstChild ? firstChild.clientWidth : 200;
      const scrollAmount = direction === 'left' ? -itemWidth * 2 : itemWidth * 2;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleDestaquesScroll = () => {
    if (destaquesScrollRef.current) {
      const container = destaquesScrollRef.current;
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth - container.clientWidth;
      if (scrollWidth <= 0) {
        setCurrentDestaqueIndicatorIndex(1);
        return;
      }
      const totalItems = 8;
      const fraction = scrollLeft / scrollWidth;
      const visibleCount = window.innerWidth >= 768 ? 4 : 2;
      const maxPossibleIndex = totalItems - visibleCount + 1;
      
      const currentVal = Math.round(fraction * (maxPossibleIndex - 1)) + 1;
      setCurrentDestaqueIndicatorIndex(Math.max(1, Math.min(currentVal, maxPossibleIndex)));
    }
  };

  const getCategoryOfMugItem = (item: { title: string; badge: string }) => {
    const badge = item.badge.toLowerCase();
    const title = item.title.toLowerCase();

    // 1. Canecas Mágicas
    if (badge.includes('mágica') || title.includes('mágica')) {
      return 'Mágicas';
    }

    // 2. Metalizadas / Glitter / Cromada / Dourada
    if (
      badge.includes('metalizada') || 
      badge.includes('dourada') || 
      badge.includes('cromada') || 
      title.includes('dourada') || 
      title.includes('metalizada') || 
      badge.includes('glitter')
    ) {
      return 'Metalizadas';
    }

    // 3. Mãe Especial
    if (badge.includes('mãe') || title.includes('mãezona') || title.includes('mãe')) {
      return 'Mãe Especial';
    }

    // 4. Com Foto
    if (badge.includes('foto') || title.includes('com foto')) {
      return 'Com Foto';
    }

    // 5. Fé & Religião
    if (
      badge.includes('fé') || 
      badge.includes('religiosa') || 
      badge.includes('foco') || 
      badge.includes('inspiração') || 
      title.includes('fé') || 
      badge.includes('bíblia') || 
      title.includes('jesus')
    ) {
      return 'Fé & Inspiração';
    }

    // 6. Corporativo & Atacado
    if (
      badge.includes('atacado') || 
      badge.includes('empresas') || 
      badge.includes('corporativo') || 
      title.includes('corporativa') ||
      title.includes('brinde')
    ) {
      return 'Corporativo & Atacado';
    }

    // Fallbacks para as gerais:
    if (
      badge.includes('divertida') || 
      badge.includes('humor') || 
      title.includes('risotril') || 
      title.includes('relaxol') || 
      title.includes('paracetamol') || 
      title.includes('foda-se') || 
      title.includes('remédio') || 
      title.includes('podia ser') ||
      title.includes('chefona')
    ) {
      return 'Divertidíssimas';
    }
    
    if (
      badge.includes('signo') || 
      badge.includes('zodíaco') || 
      badge.includes('astrologia') ||
      title.includes('signo')
    ) {
      return 'Signos & Astrologia';
    }

    if (
      badge.includes('anime') || 
      badge.includes('desenho') || 
      badge.includes('super poderosas') || 
      badge.includes('naruto') ||
      title.includes('naruto') ||
      title.includes('dragon ball') ||
      title.includes('desenho') ||
      title.includes('nojinho') ||
      title.includes('poderosas')
    ) {
      return 'Animes & Desenhos';
    }

    if (
      badge.includes('colher') || 
      badge.includes('conjunto') || 
      badge.includes('imperial') || 
      badge.includes('kits') ||
      badge.includes('kit') ||
      title.includes('kit') ||
      title.includes('xícara')
    ) {
      return 'Kits & Modelos Especiais';
    }

    return 'Afeto, Fé & Música';
  };

  // Array of featured real custom showcase mugs passing in the gallery (8 elements for exactly 2 pages of 2x2 grid)
  const galleryItems = [
    {
      title: 'Caneca Mãezona',
      tagline: 'Homenagem especial com carinho e cores vibrantes para a melhor mãe.',
      image: 'https://i.postimg.cc/SR2X9crG/caneca-maezona-personalizada.jpg',
      badge: 'Mãe Especial',
      fitClass: 'object-cover object-center',
      ctaText: 'Gostei desta!',
      infinitePayLink: 'https://www.asaas.com/c/hkshm4kax00qpofy'
    },
    {
      title: 'Caneca com Colher',
      tagline: 'Design elegante com colher integrada para combinar praticidade e estilo.',
      image: 'https://i.postimg.cc/6316sN1x/caneca-com-colher-personalizada-branca-e-preta.webp',
      badge: 'Com Colher',
      fitClass: 'object-cover object-center',
      ctaText: 'Gostei desta!'
    },
    {
      title: 'Canecas Metálicas',
      tagline: 'O brilho sofisticado e acabamento premium em dourado e rosa metalizado.',
      image: 'https://i.postimg.cc/P54P60hs/caneca-dourada-e-rosa-metalica-personalizada.webp',
      badge: 'Metalizada',
      fitClass: 'object-cover object-center',
      ctaText: 'Adorei essa!'
    },
    {
      title: 'Meninas Super Poderosas',
      tagline: 'Super coloridas, nostálgicas e cheias de energia para a sua rotina.',
      image: 'https://i.postimg.cc/SxNyKR01/canecas-meninas-super-poderosas-personalizada.webp',
      badge: 'Super Poderosas',
      fitClass: 'object-cover object-center',
      ctaText: 'Gostei desta!'
    },
    {
      title: 'Kit com 4 Xícaras',
      tagline: 'Lindo conjunto de mini xícaras personalizadas acompanhado por um suporte elegante.',
      image: 'https://i.postimg.cc/VNhZ3fPx/xicaras-personalizadas-kit-com-4-xicaras.webp',
      badge: 'Conjunto Especial',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero este!'
    },
    {
      title: 'Desenhos Animados',
      tagline: 'As lembranças dos seus desenhos favoritos reunidas em uma linda estampa.',
      image: 'https://i.postimg.cc/8cZpSfkf/caneca-desenho-animados-personalizados.webp',
      badge: 'Desenho Animado',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero esta!'
    },
    {
      title: 'Michael Jackson',
      tagline: 'Uma linda homenagem de fã ao eterno Rei do Pop com design impecável.',
      image: 'https://i.postimg.cc/Sx2MgkVg/caneca-personalizada-michael-jackson.webp',
      badge: 'Pop Star',
      fitClass: 'object-cover object-center',
      ctaText: 'Adorei essa!'
    },
    {
      title: 'Dragon Ball Z',
      tagline: 'O poder saiyajin em uma estampa vibrante e cheia de ação.',
      image: 'https://i.postimg.cc/j21jfnpG/canecas-personalizada-dragon-ball.webp',
      badge: 'Anime',
      fitClass: 'object-cover object-center',
      ctaText: 'Gostei desta!'
    },
    {
      title: 'Caneca com Colher Amarela',
      tagline: 'Vibração e praticidade com o conjunto de alça e colher amarelas em destaque.',
      image: 'https://i.postimg.cc/WbrDZX4J/caneca-com-colher-alca-amarela-personalizada.webp',
      badge: 'Alça & Colher',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero esta!'
    },
    {
      title: 'Caneca Risotril',
      tagline: 'Dose diária de bom humor com a criativa embalagem de remédio personalizada.',
      image: 'https://i.postimg.cc/G21gcM96/caneca-risotril-personalizada-remedio.webp',
      badge: 'Divertida',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero esta!'
    },
    {
      title: 'Você Pode Tudo',
      tagline: 'Uma mensagem motivadora e inspiradora para começar todos os dias com força e positividade.',
      image: 'https://i.postimg.cc/d0DZhvZT/caneca-personalizada-voce-pode-tudo.webp',
      badge: 'Motivacional',
      fitClass: 'object-cover object-center',
      ctaText: 'Achei linda!'
    },
    {
      title: 'Signo de Gêmeos',
      tagline: 'Leve toda a versatilidade, inteligência e o charme do signo de Gêmeos para o seu café.',
      image: 'https://i.postimg.cc/TY9KQhry/caneca-personalizada-signo-de-gemeos.webp',
      badge: 'Zodíaco',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero meu signo!'
    },
    {
      title: 'Caneca Imperial',
      tagline: 'Elegância e riqueza de detalhes marcantes para tornar seus momentos ainda mais nobres.',
      image: 'https://i.postimg.cc/kXn4V9kP/caneca-imperial-personalizada.webp',
      badge: 'Imperial',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero esta!'
    },
    {
      title: 'Personalizada Fernanda',
      tagline: 'Seu nome envolvido por delicadas flores em um design exclusivo e encantador.',
      image: 'https://i.postimg.cc/G3j3nV9N/caneca-personalizada-fernanda.webp',
      badge: 'Nome & Floral',
      fitClass: 'object-cover object-center',
      ctaText: 'Comprar esta!'
    },
    {
      title: 'Caneca Nojinho',
      tagline: 'A personalidade cheia de estilo e opinião da Nojinho (Divertida Mente) para alegrar sua rotina.',
      image: 'https://i.postimg.cc/tRDbM6mL/caneca-personalizada-nojinho.webp',
      badge: 'Divertida Mente',
      fitClass: 'object-cover object-center',
      ctaText: 'Amei esta!'
    },
    {
      title: 'Tributo Michael Jackson',
      tagline: 'Uma homenagem digna ao Rei do Pop para embalar seu café com ritmo e muita nostalgia.',
      image: 'https://i.postimg.cc/Pqn0xfRQ/caneca-personalizada-michael-jackson-tributo.webp',
      badge: 'Música & Pop',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero este tributo!'
    },
    {
      title: 'Caneca com Foto',
      tagline: 'Eternize os seus melhores momentos e recordações mais queridas em uma linda caneca.',
      image: 'https://i.postimg.cc/zvHkKKLw/caneca-personalizada-com-foto.webp',
      badge: 'Com Foto',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero com foto!'
    },
    {
      title: 'Poderosa Chefona',
      tagline: 'Mostre quem está no comando com muito estilo, atitude e bom humor.',
      image: 'https://i.postimg.cc/D01BR176/caneca-personalizada-poderosa-chefona.webp',
      badge: 'Empoderada',
      fitClass: 'object-cover object-center',
      ctaText: 'Essa é a minha!'
    },
    {
      title: 'Dourada Thalita',
      tagline: 'O brilho sofisticado e luxuoso do dourado metalizado personalizado com seu nome.',
      image: 'https://i.postimg.cc/qvvxxP6m/caneca-personalizada-dourada-thalita.webp',
      badge: 'Exclusiva Dourada',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero esta dourada!'
    },
    {
      title: 'Caneca Foda-se',
      tagline: 'A dose diária de tranquilidade e bom humor que você precisa para encarar o dia de forma leve.',
      image: 'https://i.postimg.cc/hjWm66hS/caneca-personalizada-fodas-remedio.webp',
      badge: 'Divertida',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero essa dose!'
    },
    {
      title: 'Corporativa & Atacado',
      tagline: 'Destaque sua marca com o logotipo da sua empresa ou faça encomendas em grande escala para brindes e eventos.',
      image: 'https://i.postimg.cc/CKHMMQmh/caneca-personalizada-para-empresas-e-atacado.webp',
      badge: 'Brindes & Atacado',
      fitClass: 'object-cover object-center',
      ctaText: 'Fazer orçamento!'
    },
    {
      title: 'Fé, Foco e Força',
      tagline: 'Inspiração diária e motivação constante para superar qualquer desafio com determinação e fé.',
      image: 'https://i.postimg.cc/K8hyK5Kf/caneca-personalizada-fe-foco-forca.webp',
      badge: 'Fé & Inspiração',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero esta com fé!'
    },
    {
      title: 'Caneca Naruto',
      tagline: 'O espírito ninja de Konoha estampado em uma caneca vibrante e cheia de determinação.',
      image: 'https://i.postimg.cc/s2qFr9R2/caneca-personalizada-naruto.webp',
      badge: 'Anime & Naruto',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero ser ninja!'
    },
    {
      title: 'É Café, mas podia ser...',
      tagline: 'A verdade sincera estampada com muita diversão para descontrair na hora do café ou no escritório.',
      image: 'https://i.postimg.cc/9M5xbxhg/caneca-personalizada-e-cafe-mas-podia-ser-cerveja.webp',
      badge: 'Humor',
      fitClass: 'object-cover object-center',
      ctaText: 'Amei esta!'
    },
    {
      title: 'Caneca Signo Aquário',
      tagline: 'Para os originais, independentes e criativos de Aquário que adoram inovação até na hora do café.',
      image: 'https://i.postimg.cc/SshrCJ67/caneca-personalizada-signo-aquario.webp',
      badge: 'Signos & Astrologia',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero de Aquário!'
    },
    {
      title: 'Caneca Signo Virgem',
      tagline: 'Organização, inteligência e perfeccionismo em cada detalhe, combinando perfeitamente com a rotina do virginiano.',
      image: 'https://i.postimg.cc/JzHcFbKk/caneca-personalizada-signo-virgem.webp',
      badge: 'Signos & Astrologia',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero de Virgem!'
    },
    {
      title: 'Caneca Mágica',
      tagline: 'Surpreenda-se! Uma caneca preta fosca que revela seu design ou foto personalizada ao entrar em contato com líquido quente.',
      image: 'https://i.postimg.cc/rmZDcHwN/caneca-personalizada-magica.webp',
      badge: 'Efeito Mágico',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero a mágica!'
    },
    {
      title: 'Caneca Café Remédio',
      tagline: 'A dose diária de cafeína prescrita com muito humor e diversão para revitalizar o seu dia.',
      image: 'https://i.postimg.cc/52JLsZYw/caneca-personalizada-cafe-remedio.webp',
      badge: 'Divertida',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero meu remedinho!'
    },
    {
      title: 'Kit de Xícaras Personalizadas',
      tagline: 'O conjunto perfeito de xícaras personalizadas para receber seus convidados com elegância ou presentear quem você ama.',
      image: 'https://i.postimg.cc/cL16gZtt/kit-xicaras-personalizadas.webp',
      badge: 'Conjuntos & Kits',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero este kit!'
    },
    {
      title: 'Caneca Relaxol',
      tagline: 'Relaxe com bom humor! A dose perfeita de paz e tranquilidade em uma caneca divertida para aliviar o estresse diário.',
      image: 'https://i.postimg.cc/5N4fpg9f/canecas-personalizadas-relaxol.webp',
      badge: 'Divertida',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero relaxar!'
    },
    {
      title: 'Caneca Paracetamol',
      tagline: 'Uma dose extra de risadas e café para combater qualquer dor de cabeça do dia a dia.',
      image: 'https://i.postimg.cc/zBw1Fb9W/canecas-personalizadas-paracetamol.webp',
      badge: 'Divertida',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero paracetamol!'
    },
    {
      title: 'Caneca Desenhos Infantis',
      tagline: 'Guarde as obras de arte mais fofistas desenhadas pelos seus filhos estampadas para sempre na caneca favorita da família.',
      image: 'https://i.postimg.cc/sDNbS4vk/canecas-personalizadas-desenhos-infantis.webp',
      badge: 'Infantil & Recordação',
      fitClass: 'object-cover object-center',
      ctaText: 'Quero eternizar desenhos!'
    }
  ];

  const selectedGalleryItem = selectedGalleryIndex !== null ? galleryItems[selectedGalleryIndex] : null;

  // Coleção completa de Canecas Disponíveis para o Lightbox/Zoom Dinâmico
  const availableMugs = [
    {
      title: 'Caneca Branca',
      tagline: 'O clássico indispensável em porcelana super branca de alta densidade e com brilho impecável.',
      image: 'https://i.postimg.cc/1Xf8vVqG/caneca-branca-personalizada.webp',
      badge: 'Clássica',
      fitClass: 'object-cover',
      ctaText: 'Quero a Branca!',
      whatsappType: 'Caneca Branca',
      whatsappSub: 'Tenho interesse na Caneca Branca Personalizada do destaque',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    },
    {
      title: 'Caneca Preta',
      tagline: 'Elegância refinada em acabamento preto brilhante profundo, ideal para artes de alto contraste ou logos corporativas.',
      image: 'https://i.postimg.cc/N0BLWzHW/caneca-preta-personalizada.webp',
      badge: 'Premium Black',
      fitClass: 'object-cover',
      ctaText: 'Quero a Preta!',
      whatsappType: 'Caneca Preta',
      whatsappSub: 'Tenho interesse na caneca preta personalizada do destaque',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    },
    {
      title: 'Caneca Dourada Metalizada',
      tagline: 'Brilho espelhado dourado ultra luxuoso que transforma a caneca em uma verdadeira joia cintilante.',
      image: 'https://i.postimg.cc/qqs5ZwC1/caneca-dourada-metalizada-personalizada.webp',
      badge: 'Luxo Metalizado',
      fitClass: 'object-cover',
      ctaText: 'Quero a Dourada!',
      whatsappType: 'Caneca Dourada Metalizada',
      whatsappSub: 'Tenho interesse na Caneca Dourada Metalizada personalizada do destaque',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    },
    {
      title: 'Caneca Cromada Rosa',
      tagline: 'Charme impecável com acabamento cromado rosa metálico, brilhante e de excelente presença afetiva.',
      image: 'https://i.postimg.cc/PrK6pPWc/caneca-rosa-cromada-personalizada.webp',
      badge: 'Cromada Rosa',
      fitClass: 'object-cover',
      ctaText: 'Quero a Rosa!',
      whatsappType: 'Caneca Cromada Rosa',
      whatsappSub: 'Tenho interesse na Caneca Cromada Rosa Personalizada do destaque',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    },
    {
      title: 'Caneca Cromada Prata',
      tagline: 'Efeito espelhado cromado prata metálico de alto impacto, trazendo design tecnológico e futurista.',
      image: 'https://i.postimg.cc/kXZbpCqS/caneca-cromada-personalizada.webp',
      badge: 'Cromada Prata',
      fitClass: 'object-cover',
      ctaText: 'Quero a Cromada!',
      whatsappType: 'Caneca Cromada',
      whatsappSub: 'Tenho interesse na Caneca Cromada personalizada do destaque',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    },
    {
      title: 'Caneca Imperial',
      tagline: 'Paredes espessas de porcelana nobre europeia com alça decorada para uma requintada hora do café.',
      image: 'https://i.postimg.cc/x8B1t0Mf/caneca-imperial-personalizada.webp',
      badge: 'Imperial Premium',
      fitClass: 'object-cover',
      ctaText: 'Quero a Imperial!',
      whatsappType: 'Caneca Imperial',
      whatsappSub: 'Tenho interesse na Caneca Imperial Premium do destaque',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    },
    {
      title: 'Caneca com Colher',
      tagline: 'Acompanhada de colher de cerâmica que se acopla perfeitamente na alça colorida, combinando charme e praticidade.',
      image: 'https://i.postimg.cc/x1Bx3BXH/caneca-com-colher-personalizada.webp',
      badge: 'Com Colher',
      fitClass: 'object-cover',
      ctaText: 'Quero com Colher!',
      whatsappType: 'Caneca com Colher',
      whatsappSub: 'Tenho interesse na Caneca com Colher personalizada do destaque',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    },
    {
      title: 'Caneca Mágica',
      tagline: 'Surpreenda a todos! A imagem personalizada se revela magicamente ao receber qualquer bebida quente.',
      image: 'https://i.postimg.cc/L6wMbgFx/caneca-magica-personalizada-banner-vitrine.webp',
      badge: 'Mágica Revelável',
      fitClass: 'object-cover',
      ctaText: 'Quero a Mágica!',
      whatsappType: 'Caneca Mágica',
      whatsappSub: 'Tenho interesse na Caneca Mágica Personalizada com foto revelável',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    },
    {
      title: 'Caneca com Alça de Coração',
      tagline: 'Símbolo perfeito de carinho com alça anatômica romântica em formato de coração e porcelana selecionada.',
      image: 'https://i.postimg.cc/qq84p2WR/caneca-alca-de-coracao-personalizada.webp',
      badge: 'Alça de Coração',
      fitClass: 'object-cover',
      ctaText: 'Quero a com Alça Coração!',
      whatsappType: 'Caneca com Alça de Coração',
      whatsappSub: 'Tenho interesse na Caneca com Alça de Coração personalizada do destaque',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    },
    {
      title: 'Canecas Corporativas',
      tagline: 'Soluções personalizadas em escala com excelente fidelidade de cozimento para parcerias empresariais e eventos em atacado.',
      image: 'https://i.postimg.cc/mDks10Jh/canecas-personalizadas-no-atacado.webp',
      badge: 'Corporativo & Atacado',
      fitClass: 'object-cover',
      ctaText: 'Fazer Orçamento Atacado!',
      whatsappType: 'Canecas Corporativas',
      whatsappSub: 'Tenho interesse nas Canecas Corporativas da empresa e atacado para eventos',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    },
    {
      title: 'Xícara Personalizada',
      tagline: 'Delicada xícara de porcelana com ótimo toque para servir chá ou café expresso de forma aconchegante e luxuosa.',
      image: 'https://i.postimg.cc/Hnpqmb2t/xicara-personalizada.webp',
      badge: 'Xícara Gourmet',
      fitClass: 'object-cover',
      ctaText: 'Quero as Xícaras!',
      whatsappType: 'Xícara Personalizada',
      whatsappSub: 'Tenho interesse na Xícara Personalizada de Porcelana do destaque direito',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    },
    {
      title: 'Caneca Sagrada',
      tagline: 'Uma estampa abençoada de Jesus Cristo em porcelana selecionada de alta resolução, unindo beleza e religiosidade.',
      image: 'https://i.postimg.cc/qRZLMtnt/caneca-sagrada-1080x600-banner-vitrine.jpg',
      badge: 'Religiosa & Fé',
      fitClass: 'object-cover',
      ctaText: 'Quero a Caneca Sagrada!',
      whatsappType: 'Caneca Sagrada',
      whatsappSub: 'Tenho interesse na Caneca Sagrada Personalizada do destaque',
      infinitePayLink: '' // 💸 COLOQUE AQUI O LINK CONFIGURADO DA INFINITEPAY
    }
  ];

  const selectedAvailableMugItem = selectedAvailableMugIndex !== null ? availableMugs[selectedAvailableMugIndex] : null;

  // Coleção para o carrosel dos Destaques (Featured) contendo fotos variadas
  const destaqueItems = [
    {
      title: 'Caneca Mãezona',
      tagline: 'Homenagem especial com carinho e cores vibrantes para a melhor mãe ou avó.',
      image: 'https://i.postimg.cc/SR2X9crG/caneca-maezona-personalizada.jpg',
      badge: 'Mais Vendidos',
      ctaText: 'Gostei desta!',
      type: 'gallery',
      originalIndex: 0
    },
    {
      title: 'Canecas Metálicas',
      tagline: 'O brilho sofisticado e acabamento premium em dourado e rosa metalizado de alta densidade.',
      image: 'https://i.postimg.cc/P54P60hs/caneca-dourada-e-rosa-metalica-personalizada.webp',
      badge: 'Metalizada',
      ctaText: 'Adorei essa!',
      type: 'gallery',
      originalIndex: 2
    },
    {
      title: 'Você Pode Tudo',
      tagline: 'Uma mensagem motivadora e inspiradora para começar todos os dias com positividade absoluta.',
      image: 'https://i.postimg.cc/d0DZhvZT/caneca-personalizada-voce-pode-tudo.webp',
      badge: 'Mais Vendidos',
      ctaText: 'Achei linda!',
      type: 'gallery',
      originalIndex: 10
    },
    {
      title: 'Caneca com Alça de Coração',
      tagline: 'O amor em cada detalhe com alça em formato de coração para encantar quem você quer bem.',
      image: 'https://i.postimg.cc/qq84p2WR/caneca-alca-de-coracao-personalizada.webp',
      badge: 'Alça de Coração',
      ctaText: 'Achei super fofa!',
      type: 'available',
      originalIndex: 8
    },
    {
      title: 'Caneca Branca',
      tagline: 'O clássico indispensável em porcelana super branca de alta densidade e brilhante.',
      image: 'https://i.postimg.cc/1Xf8vVqG/caneca-branca-personalizada.webp',
      badge: 'Variado',
      ctaText: 'Quero a branca!',
      type: 'available',
      originalIndex: 0
    },
    {
      title: 'Caneca Risotril',
      tagline: 'Dose diária de bom humor com a criativa embalagem de remédio simulada.',
      image: 'https://i.postimg.cc/G21gcM96/caneca-risotril-personalizada-remedio.webp',
      badge: 'Divertida',
      ctaText: 'Quero esta!',
      type: 'gallery',
      originalIndex: 9
    },
    {
      title: 'Caneca Imperial',
      tagline: 'Elegância de realeza com detalhes dourados sofisticados para momentos nobres.',
      image: 'https://i.postimg.cc/kXn4V9kP/caneca-imperial-personalizada.webp',
      badge: 'Variado',
      ctaText: 'Quero a imperial!',
      type: 'available',
      originalIndex: 5
    },
    {
      title: 'Xícara Personalizada',
      tagline: 'Delicada xícara de porcelana ideal para servir aquele café expresso gourmet.',
      image: 'https://i.postimg.cc/Hnpqmb2t/xicara-personalizada.webp',
      badge: 'Xícara',
      ctaText: 'Quero as xícaras!',
      type: 'available',
      originalIndex: 10
    }
  ];

  // Dynamic state to check if user is on mobile and calculate items per page
  const [isMobile, setIsMobile] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      if (width < 640) {
        setItemsPerPage(4);
      } else if (width < 1024) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Soft-reset the catalog slide if viewport changes to avoid out-of-bounds error
  useEffect(() => {
    setCurrentCatalogPage(0);
  }, [itemsPerPage]);

  // Active theme catalog carousel pages
  const [currentThemeDesktopPage, setCurrentThemeDesktopPage] = useState(0);
  const [currentThemeMobilePage, setCurrentThemeMobilePage] = useState(0);

  // Image assets defined during the generation steps
  const heroImages = [
    {
      src: 'https://i.postimg.cc/MG55N3pt/caneca-sagrada-personalizada-fullbanner-pc.webp', // Caneca Sagrada Desktop
      desktopSrc: 'https://i.postimg.cc/MG55N3pt/caneca-sagrada-personalizada-fullbanner-pc.webp',
      mobileSrc: 'https://i.postimg.cc/76L9k1Cr/caneca-sagrada-1080-otimizada-full-banner-mobile.jpg', // Caneca Sagrada Mobile
      type: 'cover',
      desktopType: 'cover',
      mobileType: 'cover'
    },
    {
      src: 'https://i.postimg.cc/wT9Hptx3/caneca-com-colher-personalizada-pc.webp', // Caneca com Colher
      desktopSrc: 'https://i.postimg.cc/wT9Hptx3/caneca-com-colher-personalizada-pc.webp',
      mobileSrc: 'https://i.postimg.cc/rs8Hvr19/caneca-com-colher-personalizada-mobile.webp',
      type: 'cover',
      desktopType: 'cover',
      mobileType: 'cover'
    },
    {
      src: 'https://i.postimg.cc/8CfgHM4M/caneca-metalizada-cromada-personalizada-pc.webp', // Caneca Metálica
      desktopSrc: 'https://i.postimg.cc/8CfgHM4M/caneca-metalizada-cromada-personalizada-pc.webp',
      mobileSrc: 'https://i.postimg.cc/L4TwjxSy/caneca-metalizada-cromada-personalizada-mobile.webp',
      type: 'cover',
      desktopType: 'cover',
      mobileType: 'cover'
    },
    {
      src: 'https://i.postimg.cc/3JrMqP92/xicaras-personalizadas-pc.webp', // Xícara Personalizada
      desktopSrc: 'https://i.postimg.cc/3JrMqP92/xicaras-personalizadas-pc.webp',
      mobileSrc: 'https://i.postimg.cc/tCvcM7s0/xicaras-personalizadas-mobile.webp',
      type: 'cover',
      desktopType: 'cover',
      mobileType: 'cover'
    }
  ];

  // ==========================================
  // CONFIGURAÇÃO DO BANNER SECUNDÁRIO (VERSÃO MENOR)
  // Substitua o link de imagem abaixo pelo URL do seu banner menor quando estiver pronto!
  // ==========================================
  const secondarySmallBannerUrl = 'https://i.postimg.cc/SKjWL8j3/canecas-chocolates-quality.png';

  // Auto-play hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Auto-play benefits mobile carousel every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBenefitSlide((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleThemeSelection = (theme: ThemeCollection) => {
    handleWhatsAppRedirect({
      type: 'Personalizada',
      text: `Tema: ${theme.name}`,
      sub: theme.description
    });
  };

  const handleWhatsAppRedirect = (customData?: { type?: string; text?: string; sub?: string }) => {
    const phone = '5531993611007'; // Client's real WhatsApp Business line
    let msg = '';
    
    if (customData) {
      if (customData.sub) {
        msg = customData.sub;
      } else if (customData.type === 'Personalizada' || customData.type === 'Tema') {
        msg = `Olá! Tudo bem? Me interessei pela caneca personalizada do tema *${customData.text || 'Personalização'}*! 🎨`;
      } else if (customData.type === 'Showroom' || customData.type === 'Galeria') {
        msg = `Olá! Tudo bem? Me interessei pela caneca *"${customData.text}"* da galeria! 😍`;
      } else if (customData.type === 'Especial' || customData.type === 'Data') {
        msg = `Olá! Tudo bem? Me interessei pela caneca da coleção *${customData.text || 'Presente Especial'}*! 🎉`;
      } else if (customData.type?.toLowerCase() === 'canecas corporativas') {
        msg = `Olá! Tudo bem? Me interessei pelas *Canecas Corporativas / Lote de Revenda*! 💼`;
      } else {
        msg = `Olá! Tudo bem? Me interessei pela caneca *${customData.text || 'Personalizada'}* (${customData.type || 'Premium'})! ☕`;
      }
    } else {
      msg = `Olá! Tudo bem? Estava navegando no seu site de Canecas Personalizadas e gostaria de tirar dúvidas! 💬`;
    }

    const encodeMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/${phone}?text=${encodeMsg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F6F5F2] text-[#2B2B2B] selection:bg-[#C8A66A] selection:text-white font-sans antialiased">
      
      {/* 🔔 TOAST NOTIFICATION OF HIGH QUALITY DESIGN */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[300] max-w-md w-[90%] bg-slate-900 border border-amber-500/30 text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs md:text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🛒</span>
              <p className="font-extrabold leading-tight text-stone-100">{toastMessage}</p>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-white hover:text-[#C8A66A] font-extrabold text-sm ml-2 shrink-0 p-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛍️ Floating Unified Cart button for 3-page flow */}
      {cartItems.length > 0 && activeCheckoutLink === null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-[80] select-none font-sans"
        >
          <button
            onClick={() => {
              // Trigger unified checkout instantly!
              setActiveCheckoutLink('cart-unified-checkout');
              setActiveCheckoutName('Coleção de Canecas Escolhidas');
              setActiveCheckoutImage(cartItems[0]?.image || 'https://i.postimg.cc/SR2X9crG/caneca-maezona-personalizada.jpg');
              setActiveCheckoutIframeLoading(false);
              setCustPaymentMethod('pix_pushin');
              setCheckoutStep(1);
            }}
            className="flex items-center gap-3 bg-gradient-to-r from-[#C8A66A] to-[#B8863B] text-white font-black py-4 px-5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs tracking-widest uppercase border border-amber-400/25 relative animate-bounce font-sans cursor-pointer"
            style={{ animationDuration: '3s' }}
          >
            <span className="relative flex">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
              <span className="text-base leading-none">🛒</span>
            </span>
            <span>
              Ver Minhas Escolhas ({cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)})
            </span>
            <span className="bg-white/20 border border-white/20 text-[10px] px-2 py-0.5 rounded-full leading-none font-sans font-black">
              R$ {baseMugsSubtotal.toFixed(2).replace('.', ',')}
            </span>
          </button>
        </motion.div>
      )}

      {/* 1. HEADER REALISTA DE E-COMMERCE (MINT-GREEN & GOLD PREMIUM) */}
      <header id="header-principal" className="sticky top-0 z-50 bg-[#0c362b] text-white border-b border-[#C8A66A]/30 shadow-md">
        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo */}
            <a href="#inicio" className="flex items-center space-x-2 shrink-0 group">
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-[#C8A66A] bg-[#F6F5F2] shadow-[0_0_12px_rgba(200,166,106,0.25)] transition-transform duration-500 group-hover:rotate-12">
                <span className="text-[#0c362b] font-display font-black text-sm sm:text-lg">Q</span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#25D366] rounded-full animate-pulse"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-sm sm:text-lg tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#F5D59A] via-[#E6C687] to-[#C8A66A]">
                  Quality
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-wider text-amber-200/90 uppercase font-black leading-relaxed mt-0.5 font-sans">
                  Canecas Personalizadas
                </span>
              </div>
            </a>

            {/* BARRA DE PESQUISA DO SITE MODELO */}
            <div className="flex-1 max-w-lg hidden md:block relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="O que você está buscando hoje? Ex. Caneca Flork, Time, Mãe..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                  className="w-full bg-white/10 text-white placeholder-stone-300 text-xs sm:text-sm pl-4 pr-10 py-2 sm:py-2.5 rounded-full border border-white/20 focus:outline-none focus:border-[#C8A66A] focus:bg-white focus:text-stone-900 focus:placeholder-stone-400 transition-all shadow-inner"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none">
                  🔍
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-5 text-xs font-black uppercase tracking-wider select-none shrink-0 border-l border-white/20 pl-5">
              <button 
                onClick={() => setActiveTab('home')} 
                className={`transition-all duration-200 cursor-pointer hover:text-amber-300 py-1 ${activeTab === 'home' ? 'text-amber-300 border-b-2 border-amber-300' : 'text-stone-200'}`}
              >
                Início
              </button>
              <button 
                onClick={() => {
                  if (selectedAvailableMugIndex === null && selectedGalleryIndex === null) {
                    setSelectedGalleryIndex(0);
                  }
                  setActiveTab('detalhes');
                }} 
                className={`transition-all duration-200 cursor-pointer hover:text-amber-300 py-1 ${activeTab === 'detalhes' ? 'text-amber-300 border-b-2 border-amber-300' : 'text-stone-200'}`}
              >
                Detalhes
              </button>
              <button 
                onClick={() => setActiveTab('carrinho')} 
                className={`transition-all duration-200 cursor-pointer hover:text-amber-300 py-1 ${activeTab === 'carrinho' ? 'text-amber-300 border-b-2 border-amber-300' : 'text-stone-200'}`}
              >
                Carrinho ({cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)})
              </button>
              <button 
                onClick={() => {
                  if (cartItems.length > 0) {
                    setActiveCheckoutLink('cart-unified-checkout');
                    setActiveCheckoutName('Coleção de Canecas Escolhidas');
                    setActiveCheckoutImage(cartItems[0]?.image || 'https://i.postimg.cc/SR2X9crG/caneca-maezona-personalizada.jpg');
                    setActiveCheckoutIframeLoading(false);
                    setCustPaymentMethod('pix_pushin');
                    setCheckoutStep(1);
                    setActiveTab('checkout');
                  } else {
                    setToastMessage('🛒 Seu Carrinho está vazio! Adicione uma caneca primeiro.');
                    setTimeout(() => setToastMessage(null), 4000);
                  }
                }} 
                className={`transition-all duration-200 cursor-pointer hover:text-amber-300 py-1 ${activeTab === 'checkout' ? 'text-amber-300 border-b-2 border-amber-300' : 'text-stone-200'}`}
              >
                Checkout
              </button>
              <button 
                onClick={() => setActiveTab('admin')} 
                className={`transition-all duration-200 cursor-pointer hover:text-amber-300 py-1 ${activeTab === 'admin' ? 'text-amber-300 border-b-2 border-amber-300' : 'text-stone-200'}`}
              >
                Meus Clientes
              </button>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              
              <div className="hidden sm:flex flex-col text-right leading-none text-xs text-stone-200">
                <span className="font-medium text-[10px] text-stone-300">Suporte WhatsApp</span>
                <a 
                  href="https://wa.me/5531993611007" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-bold text-white mt-1 cursor-pointer hover:text-[#25D366] transition-colors flex items-center justify-end gap-1 font-mono text-[11px] sm:text-xs no-underline"
                >
                  <span className="text-[#25D366] animate-pulse">●</span> (31) 99361-1007
                </a>
              </div>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={() => {
                  if (cartItems.length > 0) {
                    setActiveTab('carrinho');
                  } else {
                    setToastMessage('🛒 Seu Carrinho está vazio! Adicione canecas do nosso catálogo primeiro.');
                    setTimeout(() => setToastMessage(null), 4000);
                  }
                }}
                className="relative bg-white/10 hover:bg-white/15 text-white p-2.5 rounded-full border border-white/10 transition-all flex items-center justify-center cursor-pointer"
                aria-label="Ver carrinho"
              >
                <span className="text-md sm:text-lg">🛒</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-[#25D366] text-white font-extrabold text-[9px] rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#0c362b] animate-bounce">
                    {cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <div className="flex items-center">
                <button
                  id="btn-mobile-menu"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2.5 rounded-full text-white bg-white/10 border border-white/10 hover:bg-white/15 focus:outline-none transition-all cursor-pointer"
                  aria-label="Abrir menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>

            </div>

          </div>
        </div>


        {/* Mobile Search input bar */}
        <div className="bg-[#0b2b22] px-4 py-2 border-t border-white/5 block md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar na loja... Ex: Flork"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActiveTab('home');
                if (e.target.value) {
                  document.getElementById('instagram-story-highlights')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }}
              className="w-full bg-white/10 text-white placeholder-stone-300 text-xs pl-3.5 pr-8 py-1.5 rounded-full border border-white/10 focus:outline-none focus:bg-white focus:text-stone-900 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 text-[11px] pointer-events-none">
              🔍
            </span>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="bg-[#0a2921] border-t border-white/10 py-5 px-6 animate-fade-in relative z-20">
            <div className="flex flex-col space-y-4 font-bold text-sm text-stone-200">
              <button 
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} 
                className={`w-full text-left transition-all duration-200 uppercase tracking-widest border-none bg-transparent font-extrabold ${activeTab === 'home' ? 'text-amber-300' : 'text-stone-200'}`}
              >
                🏠 Página Inicial
              </button>
              
              <button 
                onClick={() => {
                  if (selectedAvailableMugIndex === null && selectedGalleryIndex === null) {
                    setSelectedGalleryIndex(0);
                  }
                  setActiveTab('detalhes');
                  setMobileMenuOpen(false);
                }} 
                className={`w-full text-left transition-all duration-200 uppercase tracking-widest border-none bg-transparent font-extrabold ${activeTab === 'detalhes' ? 'text-amber-300' : 'text-stone-200'}`}
              >
                🔍 Detalhes do Produto
              </button>

              <button 
                onClick={() => {
                  setActiveTab('carrinho');
                  setMobileMenuOpen(false);
                }} 
                className={`w-full text-left transition-all duration-200 uppercase tracking-widest border-none bg-transparent font-extrabold ${activeTab === 'carrinho' ? 'text-amber-300' : 'text-stone-200'}`}
              >
                🛒 Meu Carrinho ({cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)})
              </button>

              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (cartItems.length > 0) {
                    setActiveCheckoutLink('cart-unified-checkout');
                    setActiveCheckoutName('Coleção de Canecas Escolhidas');
                    setActiveCheckoutImage(cartItems[0]?.image || 'https://i.postimg.cc/SR2X9crG/caneca-maezona-personalizada.jpg');
                    setActiveCheckoutIframeLoading(false);
                    setCustPaymentMethod('pix_pushin');
                    setCheckoutStep(1);
                    setActiveTab('checkout');
                  } else {
                    setToastMessage('🛒 Seu Carrinho está vazio! Adicione uma caneca primeiro.');
                    setTimeout(() => setToastMessage(null), 4000);
                  }
                }} 
                className={`w-full text-left transition-all duration-200 uppercase tracking-widest border-none bg-transparent font-extrabold ${activeTab === 'checkout' ? 'text-amber-300' : 'text-stone-200'}`}
              >
                💳 Concluir Compra (Checkout)
              </button>

              <button 
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }} 
                className={`w-full text-left transition-all duration-200 uppercase tracking-widest border-none bg-transparent font-extrabold ${activeTab === 'admin' ? 'text-amber-300' : 'text-stone-200'}`}
              >
                📊 Painel do Lojista (CRM)
              </button>
              
              <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                <div className="text-amber-200 text-xs font-mono">SUPORTE VIA WHATSAPP:</div>
                <button
                  id="btn-mobile-nav-whatsapp"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleWhatsAppRedirect();
                  }}
                  className="w-full text-center px-4 py-2.5 bg-[#25D366] text-white rounded-full font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer border-none"
                >
                  <span>Chamar Atendente (31) 99361-1007</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ==================== PAGINATION / ACTIVE ABAS SYSTEM ==================== */}
      {/* ==================== PAGINATION / ACTIVE ABAS SYSTEM ==================== */}
      {/* DETALHES PAGE (PÁGINA 2) */}
      {activeTab === 'detalhes' && (() => {
        const isGallery = selectedGalleryIndex !== null;
        const activeIndex = isGallery ? selectedGalleryIndex : selectedAvailableMugIndex;
        // fallback robusto a index 0
        const activeItem = isGallery 
          ? galleryItems[selectedGalleryIndex || 0] 
          : (selectedAvailableMugIndex !== null ? availableMugs[selectedAvailableMugIndex] : galleryItems[0]);

        if (!activeItem) return (
          <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans">
            <p className="text-stone-500 font-bold">Nenhum produto selecionado para exibição.</p>
            <button onClick={() => { setActiveTab('home'); }} className="mt-4 px-6 py-2.5 bg-[#0c362b] text-white font-black rounded-lg">Ver Catálogo</button>
          </div>
        );

        const mockImages = [
          activeItem.image,
          "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80", 
          "https://images.unsplash.com/photo-1517256064527-09c53b2d0ec6?auto=format&fit=crop&w=600&q=80", 
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"  
        ];

        const itemPrice = getProductPrice(activeItem.title);

        return (
          <div id="aba-detalhes-wrapper" className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn font-sans text-stone-900">
            <div className="flex items-center gap-2 mb-6 text-stone-500 text-xs sm:text-sm font-semibold select-none">
              <button onClick={() => { setActiveTab('home'); }} className="hover:text-[#C8A66A] cursor-pointer bg-transparent border-none p-0 inline">Início</button>
              <span>&gt;</span>
              <button onClick={() => { setActiveTab('home'); }} className="hover:text-[#C8A66A] cursor-pointer bg-transparent border-none p-0 inline">Catálogo de Canecas</button>
              <span>&gt;</span>
              <span className="text-stone-800 font-bold truncate max-w-[200px]">{activeItem.title}</span>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-8 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* COL 1: IMAGENS */}
                <div className="md:col-span-6 space-y-4">
                  <div className="aspect-square bg-slate-50 rounded-2xl border border-stone-200 overflow-hidden relative flex items-center justify-center p-4">
                    {activeItem.badge && (
                      <span className="absolute top-4 left-4 bg-stone-900/85 backdrop-blur-xs text-white text-[9px] font-black uppercase px-2.5 py-1 rounded">
                        {activeItem.badge}
                      </span>
                    )}
                    <img src={mockImages[activePhotoIdx] || activeItem.image} alt={activeItem.title} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {mockImages.map((img, idx) => (
                      <button
                        key={`tab-detail-thumb-${idx}`}
                        onClick={() => { setActivePhotoIdx(idx); }}
                        className={`aspect-square rounded-xl overflow-hidden border-2 bg-white transition-all p-1 hover:scale-105 cursor-pointer ${
                          activePhotoIdx === idx ? 'border-[#C8A66A] ring-2 ring-[#C8A66A]/20' : 'border-stone-200'
                        }`}
                      >
                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* COL 2: COMPRA & CUSTOM CUSTOMIZERS */}
                <div className="md:col-span-6 space-y-6 text-left">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                      <span>⭐⭐⭐⭐⭐</span>
                      <span className="text-stone-550 font-semibold">(142 avaliações de clientes satisfeitos)</span>
                    </div>
                    <h1 className="text-xl sm:text-3xl font-display font-black uppercase text-stone-900 tracking-tight leading-tight">
                      {activeItem.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-xl">
                      {activeItem.tagline || 'Caneca Premium feita com cerâmica AAA+ importada de altíssimo brilho, acabamento refinado e durabilidade extrema.'}
                    </p>
                  </div>

                  {/* PREÇO */}
                  <div className="bg-gradient-to-r from-stone-50 to-white border border-stone-200 p-4 rounded-xl space-y-1">
                    {itemPrice === 5.00 ? (
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-[#5E6D5F] font-black text-2xl font-mono">
                          R$ {(5.00 * productQty).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-xs text-stone-400 line-through">De R$ {((itemPrice * 1.1) * productQty).toFixed(2).replace('.', ',')}</span>
                        <span className="text-[#5E6D5F] font-black text-2xl font-mono">
                          R$ {(itemPrice * productQty * 0.9).toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded font-black uppercase font-sans">
                          ✓ 10% Desconto Pix
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-stone-500">
                      Ou R$ {(itemPrice * productQty).toFixed(2).replace('.', ',')} em até 3x sem juros no cartão
                    </p>
                  </div>

                  {/* FORM DESIGN PERSONALIZAÇÃO */}
                  <div className="bg-[#FAF8F5] border-2 border-dashed border-[#C8A66A]/35 rounded-2xl p-4 sm:p-5 space-y-4">
                    <h3 className="text-xs font-black text-[#A68042] uppercase flex items-center gap-1.5 leading-none pl-1 border-l-2 border-[#C8A66A]">
                      ✨ Customizar Caneca (Opcional & Gratuito)
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-stone-750 uppercase block">
                        Anexar Arte ou Foto (Opcional):
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 border-2 border-dashed border-stone-300 hover:border-[#C8A66A]/50 bg-white hover:bg-stone-50 rounded-xl p-3 text-center cursor-pointer transition-all">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setCustomPhotoName(file.name);
                                const reader = new FileReader();
                                reader.onload = (loadEvt) => {
                                  setCustomPhoto(loadEvt.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <span className="text-xl block mb-0.5">📸</span>
                          <span className="text-[10px] text-stone-600 font-black uppercase leading-none block">Selecionar Imagem</span>
                        </label>
                        
                        {customPhoto && (
                          <div className="relative w-14 h-14 rounded-xl border border-stone-200 overflow-hidden bg-white shrink-0 p-1 group">
                            <img src={customPhoto} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                            <button
                              onClick={() => { setCustomPhoto(null); setCustomPhotoName(''); }}
                              className="absolute inset-0 bg-red-600/90 text-white font-black text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>
                        )}
                      </div>
                      {customPhotoName && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Selecionada: {customPhotoName}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-stone-750 uppercase block">
                        Escrever Texto ou Nome (Opcional):
                      </label>
                      <textarea
                        value={customText}
                        onChange={(e) => { setCustomText(e.target.value); }}
                        placeholder="Ex: Nome 'Letícia' no verso com letra manuscrita fina..."
                        className="w-full min-h-[50px] p-2 bg-white border border-stone-200 rounded-xl font-sans resize-none placeholder-stone-400"
                      />
                    </div>
                  </div>

                  {/* QUANTIDADE */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-stone-700 uppercase">Quantidade:</span>
                    <div className="flex items-center bg-white border border-stone-200 rounded-lg overflow-hidden h-9 w-28">
                      <button onClick={() => { setProductQty(p => Math.max(1, p - 1)); }} className="w-9 h-full bg-slate-50 hover:bg-slate-100 text-stone-650 font-black border-r border-stone-200">-</button>
                      <span className="flex-1 text-center font-mono text-xs font-black">{productQty}</span>
                      <button onClick={() => { setProductQty(p => p + 1); }} className="w-9 h-full bg-slate-50 hover:bg-slate-100 text-stone-650 font-black border-l border-stone-200">+</button>
                    </div>
                  </div>

                  {/* CTAS */}
                  <div className="space-y-2.5 pt-2 text-xs">
                    <button
                      onClick={() => {
                        const cartItemToAdd = {
                          title: activeItem.title,
                          image: activeItem.image,
                          qty: productQty,
                          price: itemPrice,
                          customText: customText,
                          customPhoto: customPhoto,
                          customPhotoName: customPhotoName,
                          originalIndex: activeIndex !== null ? activeIndex : 0
                        };
                        
                        setCartItems(prev => {
                          const existingIdx = prev.findIndex(i => i.title === activeItem.title);
                          let updated;
                          if (existingIdx > -1) {
                            updated = [...prev];
                            updated[existingIdx] = {
                              ...updated[existingIdx],
                              qty: updated[existingIdx].qty + productQty,
                              customText: customText || updated[existingIdx].customText,
                              customPhoto: customPhoto || updated[existingIdx].customPhoto,
                              customPhotoName: customPhotoName || updated[existingIdx].customPhotoName
                            };
                          } else {
                            updated = [...prev, cartItemToAdd];
                          }
                          return updated;
                        });

                        setActiveCheckoutLink('cart-unified-checkout');
                        setActiveCheckoutName('Coleção de Canecas Escolhidas');
                        setActiveCheckoutImage(activeItem.image);
                        setActiveCheckoutIframeLoading(false);
                        setCustPaymentMethod('pix_pushin');
                        setCheckoutStep(1);
                        setActiveTab('checkout');
                      }}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-[#B8863B] text-white font-black uppercase tracking-widest rounded-xl hover:brightness-105 active:scale-95 transition-all cursor-pointer border-none shadow-md"
                    >
                      Comprar Agora 💳
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const cartItemToAdd = {
                            title: activeItem.title,
                            image: activeItem.image,
                            qty: productQty,
                            price: itemPrice,
                            customText: customText,
                            customPhoto: customPhoto,
                            customPhotoName: customPhotoName,
                            originalIndex: activeIndex !== null ? activeIndex : 0
                          };
                          
                          setCartItems(prev => {
                            const existingIdx = prev.findIndex(i => i.title === activeItem.title);
                            let updated;
                            if (existingIdx > -1) {
                              updated = [...prev];
                              updated[existingIdx] = {
                                ...updated[existingIdx],
                                qty: updated[existingIdx].qty + productQty,
                                customText: customText || updated[existingIdx].customText,
                                customPhoto: customPhoto || updated[existingIdx].customPhoto,
                                customPhotoName: customPhotoName || updated[existingIdx].customPhotoName
                              };
                            } else {
                              updated = [...prev, cartItemToAdd];
                            }
                            return updated;
                          });

                          setToastMessage(`🛒 Caneca "${activeItem.title}" adicionada com sucesso!`);
                          setTimeout(() => setToastMessage(null), 4000);
                        }}
                        className="flex-1 py-3 bg-[#0c2b22] hover:bg-emerald-800 text-white font-extrabold rounded-xl transition-all uppercase tracking-wider cursor-pointer border-none"
                      >
                        + Carrinho
                      </button>

                      <button
                        onClick={() => {
                          const personalMsg = `${customPhotoName ? `\n📸 Anexo: *[${customPhotoName}]*` : ''}${customText ? `\n✏️ Detalhe Arte: *"${customText}"*` : ''}`;
                          const msgText = `Olá, tudo bem? Gostaria de idealizar um modelo de caneca *${activeItem.title}* (Quantidade: *${productQty}x*).\n\nConsegue enviar um layout em 3D pra mim?`;
                          handleWhatsAppRedirect({
                            type: 'Showroom',
                            text: activeItem.title,
                            sub: msgText
                          });
                        }}
                        className="flex-1 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-extrabold rounded-xl transition-all uppercase tracking-wider text-center cursor-pointer border-none font-sans"
                      >
                        WhatsApp 💬
                      </button>
                    </div>

                    <button
                      onClick={() => { setActiveTab('home'); }}
                      className="w-full py-2.5 text-stone-550 hover:text-stone-800 font-bold transition-all text-center bg-transparent border-none cursor-pointer font-sans"
                    >
                      ← Voltar para a Vitrine Principal
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* CARRINHO PAGE (PÁGINA 3) */}
      {activeTab === 'carrinho' && (
        <div id="aba-carrinho-wrapper" className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn font-sans text-stone-900">
          <div className="flex items-center gap-2 mb-6 text-stone-500 text-xs sm:text-sm font-semibold select-none">
            <button onClick={() => { setActiveTab('home'); }} className="hover:text-[#C8A66A] cursor-pointer bg-transparent border-none p-0 inline">Início</button>
            <span>&gt;</span>
            <span className="text-stone-800 font-bold">Meu Carrinho</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-display font-black uppercase text-[#0b2b22] tracking-tight mb-8 text-left">
            Meu Carrinho de Compras 🛒
          </h2>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-16 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
              <span className="text-5xl sm:text-7xl">🛒</span>
              <h3 className="text-lg sm:text-xl font-bold text-stone-800">Seu carrinho está vazio</h3>
              <p className="text-stone-450 text-xs sm:text-sm max-w-md">
                Você ainda não adicionou nenhuma de nossas canecas premium ao seu carrinho. Que tal escolher os seus modelos agora?
              </p>
              <button
                onClick={() => { setActiveTab('home'); }}
                className="mt-4 px-8 py-3 bg-[#0c362b] hover:bg-[#128C7E] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none shadow-xs"
              >
                Escolher Canecas Lindas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LIST OF ITEMS COLUMN */}
              <div className="lg:col-span-8 bg-white border border-stone-200 shadow-xs rounded-3xl p-4 sm:p-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                  <span className="text-xs font-black uppercase text-stone-400 tracking-widest">Produtos no Lote</span>
                  <button 
                    onClick={() => {
                      setCartItems([]);
                      setToastMessage('🛒 Seu carrinho foi esvaziado!');
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-extrabold transition-colors cursor-pointer border-none bg-transparent"
                  >
                    Esvaziar Completo 🗑️
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {cartItems.map((item: any, idx: number) => {
                    const itemPrice = getProductPrice(item.title) * (item.qty || 1);
                    return (
                      <div key={`cart-page-item-${idx}`} className="py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between first:pt-0 last:pb-0">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-50 border border-stone-200 rounded-xl overflow-hidden p-1 shrink-0">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                          </div>
                          <div className="space-y-1 text-left font-sans">
                            <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug">{item.title}</h3>
                            {item.customText && (
                              <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1 leading-none">
                                <span>✏️</span> Gravação: <span className="font-mono text-stone-600">"{item.customText}"</span>
                              </p>
                            )}
                            {item.customPhotoName && (
                              <p className="text-[10px] text-[#A68042] font-bold flex items-center gap-1 leading-none">
                                <span>📸</span> Anexo: <span className="font-mono text-stone-600">{item.customPhotoName}</span>
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-bold text-stone-500">R$ {getProductPrice(item.title).toFixed(2).replace('.', ',')} cada</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 gap-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center bg-slate-50 border border-stone-200 rounded-lg overflow-hidden h-8 w-24 shrink-0">
                            <button
                              onClick={() => {
                                setCartItems(prev => {
                                  const updated = [...prev];
                                  if (updated[idx].qty > 1) {
                                    updated[idx] = { ...updated[idx], qty: updated[idx].qty - 1 };
                                  } else {
                                    updated.splice(idx, 1);
                                  }
                                  return updated;
                                });
                              }}
                              className="w-7 h-full hover:bg-stone-100 text-stone-600 font-black text-xs flex items-center justify-center transition-all cursor-pointer border-r border-stone-200"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center font-bold font-mono text-[11px] text-stone-800">
                              {item.qty || 1}
                            </span>
                            <button
                              onClick={() => {
                                setCartItems(prev => {
                                  const updated = [...prev];
                                  updated[idx] = { ...updated[idx], qty: (updated[idx].qty || 1) + 1 };
                                  return updated;
                                });
                              }}
                              className="w-7 h-full hover:bg-stone-100 text-stone-600 font-black text-xs flex items-center justify-center transition-all cursor-pointer border-l border-stone-200"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-stone-900 font-mono">
                              R$ {itemPrice.toFixed(2).replace('.', ',')}
                            </span>
                            <button
                              onClick={() => {
                                setCartItems(prev => prev.filter((_, i) => i !== idx));
                                setToastMessage(`🗑️ "${item.title}" removido com sucesso.`);
                                setTimeout(() => setToastMessage(null), 3500);
                              }}
                              className="p-1 text-stone-400 hover:text-red-500 cursor-pointer transition-colors border-none bg-transparent font-extrabold text-sm"
                              title="Remover"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ESTIMATIONS BAR */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-stone-200 shadow-xs rounded-3xl p-5 sm:p-6 text-left space-y-5">
                  <h3 className="text-xs font-black uppercase text-stone-400 tracking-widest border-b border-stone-100 pb-3 font-sans">
                    Resumo das Canecas
                  </h3>

                  <div className="space-y-3 text-xs sm:text-sm font-medium">
                    <div className="flex justify-between text-stone-600 font-sans">
                      <span>Subtotal das Canecas ({cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)} unids):</span>
                      <span className="font-extrabold text-stone-800 font-mono font-sans">R$ {baseMugsSubtotal.toFixed(2).replace('.', ',')}</span>
                    </div>

                    <div className="border-y border-stone-100 py-3 space-y-1.5 font-sans">
                      <div className="flex justify-between text-stone-600">
                        <span>Envio Expresso Correios:</span>
                        {cartItems.reduce((acc, i) => acc + (i.qty || 1), 0) >= 2 ? (
                          <span className="text-emerald-700 font-extrabold uppercase text-[10px] sm:text-xs">
                            ✓ FRETE GRÁTIS
                          </span>
                        ) : (
                          <span className="font-extrabold text-amber-600 font-mono">R$ 17,90</span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 leading-tight">
                        {cartItems.reduce((acc, i) => acc + (i.qty || 1), 0) >= 2 
                          ? '🔥 Parabéns! Seu lote completou 2 canecas, garantindo Frete Expresso Grátis com Seguro contra Quebras!' 
                          : '💡 Dica: Adicione apenas mais 1 caneca para zerar o frete de toda a compra!'
                        }
                      </p>
                    </div>

                    <div className="flex justify-between items-baseline pt-1 font-sans">
                      <span className="text-sm font-black text-stone-900">Total Estimado:</span>
                      <span className="text-xl sm:text-2xl font-black text-[#5E6D5F] font-mono">
                        R$ {(baseMugsSubtotal + (cartItems.reduce((acc, i) => acc + (i.qty || 1), 0) >= 2 ? 0 : 17.90)).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-sans select-none">
                    <button
                      onClick={() => {
                        setActiveCheckoutLink('cart-unified-checkout');
                        setActiveCheckoutName('Coleção de Canecas Escolhidas');
                        setActiveCheckoutImage(cartItems[0]?.image || '');
                        setActiveCheckoutIframeLoading(false);
                        setCustPaymentMethod('pix_pushin');
                        setCheckoutStep(1);
                        setActiveTab('checkout');
                      }}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-[#B8863B] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md hover:brightness-105 active:scale-95 transition-all text-center cursor-pointer border-none"
                    >
                      FINALIZAR COMPRA 💳
                    </button>

                    <button
                      onClick={() => { setActiveTab('home'); }}
                      className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 border border-stone-200 text-stone-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                    >
                      Adicionar Mais Canecas
                    </button>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-250 rounded-3xl p-5 text-left space-y-3.5">
                  <h4 className="text-xs font-black text-stone-700 uppercase tracking-wider flex items-center gap-1.5 leading-none font-sans">
                    <span>🛡️</span> Seguro Quality Mugs
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed text-justify font-sans">
                    A porcelana é enviada numa embalagem ultra reforçada anticolisão. Se qualquer peça se danificar ou quebrar no trânsito dos Correios, nós te enviamos outra novinha gratuitamente via Sedex. Só enviar foto no WhatsApp!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHECKOUT DEDICATED BLOCK FALLBACK (PÁGINA 4) */}
      {activeTab === 'checkout' && activeCheckoutLink === null && (
        <div id="aba-checkout-empty-wrapper" className="w-full max-w-7xl mx-auto px-4 py-16 text-center font-sans text-stone-900">
          <div className="max-w-md mx-auto space-y-5 bg-white border border-stone-200 p-8 rounded-3xl shadow-xs">
            <span className="text-5xl block">💳</span>
            <h3 className="text-lg sm:text-xl font-black uppercase text-stone-850">Seu Checkout está ocioso</h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Você ainda não tem nenhum pedido ativo na fila de finalização de faturamento transparente. Gostaria de adicionar canecas ou voltar para a vitrine?
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => { setActiveTab('home'); }}
                className="w-full py-3 bg-[#0c362b] text-white font-black rounded-xl cursor-pointer border-none uppercase text-xs"
              >
                Escolher Canecas da Loja
              </button>
              {cartItems.length > 0 && (
                <button
                  onClick={() => {
                    setActiveCheckoutLink('cart-unified-checkout');
                    setActiveCheckoutName('Coleção de Canecas Escolhidas');
                    setActiveCheckoutImage(cartItems[0]?.image || '');
                    setActiveCheckoutIframeLoading(false);
                    setCustPaymentMethod('pix_pushin');
                    setCheckoutStep(1);
                  }}
                  className="w-full py-3 bg-[#B8863B] text-white font-black rounded-xl cursor-pointer border-none uppercase text-xs"
                >
                  Finalizar Meus {cartItems.length} Itens do Carrinho
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAINEL DO LOJISTA CRM - MEUS CLIENTES (SUPER PÁGINA EXCLUSIVA) */}
      {activeTab === 'admin' && (
        <div id="aba-admin-wrapper" className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn font-sans text-stone-900">
          
          <div className="flex items-center gap-2 mb-6 text-stone-500 text-xs sm:text-sm font-semibold select-none">
            <button onClick={() => { setActiveTab('home'); }} className="hover:text-[#C8A66A] cursor-pointer bg-transparent border-none p-0 inline">Início</button>
            <span>&gt;</span>
            <span className="text-stone-850 font-bold">Painel do Lojista (CRM)</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="text-left">
              <h2 className="text-2xl sm:text-4xl font-display font-black uppercase text-[#0b2b22] tracking-tight">
                Painel do Lojista 🔑
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                Consulte em tempo real as informações de leads digitadas e vendas faturadas pela Quality.
              </p>
            </div>
            
            {isAdminAuthenticated && (
              <button
                onClick={() => {
                  setAdminPassword('');
                  setIsAdminAuthenticated(false);
                }}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer border-none"
              >
                Sair do Painel 🚪
              </button>
            )}
          </div>

          {!isAdminAuthenticated ? (
            /* SECURE ACCESS WINDOW CARD */
            <div className="max-w-md bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-md mx-auto text-center space-y-5">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-700 rounded-full flex items-center justify-center mx-auto text-xl">
                🔒
              </div>
              <div className="space-y-1.5 font-sans">
                <h3 className="text-base sm:text-lg font-black uppercase text-stone-850">Acesso Restrito do Vendedor</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Por motivos de LGPD e segurança bancária, o acesso aos leads e pedidos concluídos requer validação de senha.
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                loadAdminOrders();
              }} className="space-y-4">
                <div className="text-left space-y-1.5 font-sans">
                  <label className="text-[10px] font-black text-stone-750 uppercase pl-1">Senha de Entrada:</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => { setAdminPassword(e.target.value); }}
                    placeholder="Digite a senha administrativa"
                    className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 placeholder-stone-400 font-mono text-center"
                    autoFocus
                  />
                  <p className="text-[10px] text-stone-400 pl-1">Dica técnica: A senha padrão configurada é <strong className="font-bold font-mono">admin123</strong></p>
                </div>

                {isAdminError && (
                  <p className="text-xs bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-500/15 font-semibold text-left">
                    ⚠️ {isAdminError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isAdminLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-[#B8863B] text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all border-none"
                >
                  {isAdminLoading ? 'Verificando as Credenciais...' : 'Desbloquear Painel Seguro 🔑'}
                </button>
              </form>
            </div>
          ) : (
            /* CRM CLIENTS DATA PANEL WINDOW */
            <div className="space-y-8 animate-fadeIn">
              
              {/* STATUS INDICATORS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-stone-200 rounded-2xl p-5 text-left shadow-2xs space-y-1 bg-gradient-to-br from-[#0c2b22]/5 to-transparent flex flex-col font-sans">
                  <span className="text-[10px] font-black tracking-widest text-[#0c2b22] uppercase block">Total de Clientes/Leads</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-stone-900">{adminOrders.length}</span>
                    <span className="text-[10px] bg-[#0c2b22]/10 text-emerald-850 font-bold px-2 py-0.5 rounded font-mono">Ativos</span>
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-5 text-left shadow-2xs space-y-1 flex flex-col font-sans">
                  <span className="text-[10px] font-black tracking-widest text-[#0c2b22] uppercase block">Faturamento Estimado</span>
                  <div className="flex items-baseline justify-between mt-1 font-mono">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                      R$ {adminOrders.reduce((acc, order) => acc + Number(order.amount || 0), 0).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-normal px-1.5 py-0.5 rounded">Bruto</span>
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-5 text-left shadow-2xs space-y-1 flex flex-col font-sans">
                  <span className="text-[10px] font-black tracking-widest text-[#0c2b22] uppercase block">Conversão por Pix/Cartão</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-[#B8863B] font-mono">
                      {((adminOrders.filter(o => o.status === 'Completo').length / (adminOrders.length || 1)) * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-stone-400 font-black font-mono">
                      {adminOrders.filter(o => o.status === 'Completo').length} completados
                    </span>
                  </div>
                </div>
              </div>

              {/* CRM ORDERS LIST LOG SHEET */}
              <div className="bg-white border border-stone-200 shadow-xs rounded-3xl overflow-hidden text-left font-sans">
                <div className="px-5 py-4.5 border-b border-stone-150/80 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs sm:text-sm font-black text-stone-850 uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <span>👥</span> Base de Clientes do WhatsApp & Pix (JSON DB)
                  </h3>
                  <button
                    onClick={loadAdminOrders}
                    className="px-3.5 py-1.5 bg-[#0b2b22] hover:bg-emerald-800 text-white font-bold text-[10px] uppercase rounded-lg cursor-pointer border-none shadow-xs transition-all flex items-center gap-1 font-sans"
                  >
                    <span>🔄</span> Sincronizar Agora
                  </button>
                </div>

                {adminOrders.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 space-y-2">
                    <span className="text-3xl block">👥</span>
                    <p className="text-xs font-bold">Nenhum cliente registrado na base de dados local ainda.</p>
                    <p className="text-[10px] max-w-xs mx-auto">Assim que o primeiro cliente preencher dados de faturamento na página de Checkout, ele aparecerá aqui automaticamente!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] divide-y divide-stone-150 text-xs text-stone-650">
                      <thead className="bg-[#FAF8F5] text-[10px] font-black text-stone-700 uppercase tracking-widest select-none">
                        <tr>
                          <th className="px-4 py-3">Cliente / Contato</th>
                          <th className="px-4 py-3">Contato WhatsApp</th>
                          <th className="px-4 py-3">Localização de Envio (CEP)</th>
                          <th className="px-4 py-3">Lote do Pedido</th>
                          <th className="px-4 py-3 text-right">Faturado</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {adminOrders.map((order, idx) => {
                          const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Recente';

                          return (
                            <tr key={`admin-order-row-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-4.5">
                                <div className="font-extrabold text-[#0c2b22] text-[13px]">{order.name}</div>
                                <div className="text-[10px] text-stone-400 font-mono mt-0.5">{order.email || 'Sem e-mail informado'}</div>
                                <div className="text-[9px] text-stone-400 font-mono mt-0.5">CPF: {order.cpf || 'Não preenchido'}</div>
                              </td>
                              
                              <td className="px-4 py-4.5 text-left font-sans">
                                <div className="font-mono text-[11px] font-medium text-stone-750">{order.phone}</div>
                                <a
                                  href={`https://wa.me/55${order.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-1 font-bold text-[10px] text-[#25D366] hover:underline bg-transparent border-none cursor-pointer"
                                >
                                  <span>💬</span> Chamar no WhatsApp
                                </a>
                              </td>

                              <td className="px-4 py-4.5">
                                <span className="font-bold text-stone-850 text-[11px] font-mono shrink-0 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 leading-none inline-block">
                                  {order.cep || 'Sem CEP'}
                                </span>
                                <div className="text-[10px] text-stone-500 mt-1 truncate max-w-[200px]" title={`${order.street}, ${order.number} - ${order.neighborhood} - ${order.city}/${order.state}`}>
                                  {order.street ? `${order.street}, ${order.number} - ${order.neighborhood} - ${order.city}/${order.state}` : 'Endereço não informado'}
                                </div>
                              </td>

                              <td className="px-4 py-4.5">
                                <div className="font-extrabold text-stone-850 text-[11px] line-clamp-2" title={order.items}>
                                  {order.items || 'Itens não capturados'}
                                </div>
                                <div className="text-[9px] text-stone-400 font-mono mt-0.5">Enviado por: {order.shippingName || 'Sedex'} (R$ {order.shippingCost ? Number(order.shippingCost).toFixed(2).replace('.', ',') : '0,00'})</div>
                              </td>

                              <td className="px-4 py-4.5 text-right font-mono font-black text-stone-900 text-[11px]">
                                R$ {Number(order.amount || 0).toFixed(2).replace('.', ',')}
                              </td>

                              <td className="px-4 py-4.5 text-center">
                                <span className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full shadow-sm border ${
                                  order.status === 'Completo'
                                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                                    : order.status === 'Aguardando' || order.status === 'Aguardando Pagamento' || order.status === 'Iniciado'
                                    ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                                    : 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20'
                                }`}>
                                  {order.status || 'Pendente'}
                                </span>
                                <div className="text-[9px] text-stone-400 font-mono mt-1 leading-none">{formattedDate}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* CSV EXPORT UTILITY BUTTON CARD */}
              <div className="bg-[#FAF8F5] border border-stone-200 rounded-3xl p-5 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 font-sans">
                  <h4 className="text-xs font-black text-[#A68042] uppercase tracking-wider flex items-center gap-1.5 leading-none">
                    <span>📥</span> Exportar Dados para Excel (CSV de Clientes)
                  </h4>
                  <p className="text-[11px] text-stone-500 max-w-xl">
                    Se você quiser carregar estes números e contatos no Excel ou Google Sheets para criar remarketing ou listas de transmissão personalizadas, exporte a planilha CSV com um único clique.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    if (adminOrders.length === 0) return;
                    let csvContent = "data:text/csv;charset=utf-8,";
                    csvContent += "Nome,Celular,Email,CPF,CEP,Itens,Faturado,Status,Data\n";
                    adminOrders.forEach(o => {
                      const escapedItems = (o.items || '').replace(/"/g, '""');
                      csvContent += `"${o.name}","${o.phone}","${o.email || ''}","${o.cpf || ''}","${o.cep || ''}","${escapedItems}","R$ ${Number(o.amount || 0).toFixed(2)}","${o.status || ''}","${o.createdAt || ''}"\n`;
                    });
                    
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `Clientes_Quality_Mugs_${new Date().toISOString().slice(0,10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  disabled={adminOrders.length === 0}
                  className="px-5 py-3 bg-[#0c2b22] hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer border-none shadow-xs transition-all flex items-center justify-center gap-2 font-sans"
                >
                  <span>📥</span> Baixar Planilha CSV
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {activeTab === 'home' && (
        <div id="aba-home-wrapper" className="w-full animate-fadeIn">

          {/* 2. HERO SECTION / SLIDESHOW DE BANNER PRINCIPAL (DIRETO NO TOPO, IGUAL AO SITE MODELO) */}
          <section 
            id="inicio" 
            className="relative w-full overflow-hidden bg-stone-950 z-10"
          >
        <div 
          className="aspect-square sm:aspect-[1.8/1] md:aspect-[1.9/1] lg:aspect-[2.1/1] xl:aspect-[2.3/1] w-full relative select-none touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                currentHeroSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* 1. MOBILE RENDERING (block sm:hidden) */}
              <div className="block sm:hidden w-full h-full select-none">
                {((img as any).mobileType || img.type) === 'contain' ? (
                  <div className="w-full h-full relative overflow-hidden bg-[#0A0A0A] flex items-center justify-center">
                    {/* Blurred background to occupy sidebars beautifully with matching colors */}
                    <img
                      src={img.mobileSrc || img.src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    {/* Main uncropped image */}
                    <img
                      src={img.mobileSrc || img.src}
                      alt={`Caneca Personalizada Quality ${idx + 1}`}
                      className={`relative max-w-full max-h-full object-contain z-10 scale-100 ${(img as any).filterClass || ''}`}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <img
                    src={img.mobileSrc || img.src}
                    alt={`Caneca Personalizada Quality ${idx + 1}`}
                    className={`w-full h-full transition-transform duration-1000 ${
                      (img as any).mobileFitClass || (img as any).fitClass || 'object-cover scale-100 origin-center'
                    } ${(img as any).filterClass || ''}`}
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* 2. DESKTOP RENDERING (hidden sm:block) */}
              <div className="hidden sm:block w-full h-full select-none">
                {((img as any).desktopType || img.type) === 'contain' ? (
                  <div className="w-full h-full relative overflow-hidden bg-[#0A0A0A] flex items-center justify-center">
                    {/* Blurred background to occupy sidebars beautifully with matching colors */}
                    <img
                      src={img.desktopSrc || img.src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    {/* Main uncropped image */}
                    <img
                      src={img.desktopSrc || img.src}
                      alt={`Caneca Personalizada Quality ${idx + 1}`}
                      className={`relative max-w-full max-h-full object-contain z-10 scale-100 ${(img as any).filterClass || ''}`}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <img
                    src={img.desktopSrc || img.src}
                    alt={`Caneca Personalizada Quality ${idx + 1}`}
                    className={`w-full h-full transition-transform duration-1000 ${
                      (img as any).desktopFitClass || (img as any).fitClass || 'object-cover scale-100 origin-center'
                    } ${(img as any).filterClass || ''}`}
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              {heroImages.length > 1 && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2.5 sm:p-5 flex items-center justify-end pointer-events-none">
                  <div className="bg-[#0A0A0A]/70 backdrop-blur-sm flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded border border-white/10 text-[8px] sm:text-xs font-mono font-medium text-white/80 mb-3 sm:mb-5">
                    {idx + 1}/{heroImages.length}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation arrows for fast switching, placed elegantly at left/right middle */}
        {heroImages.length > 1 && (
          <>
            <button
              onClick={() => setCurrentHeroSlide((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1))}
              className="absolute left-3 top-[35%] sm:top-1/2 -translate-y-1/2 sm:left-4 z-20 w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/90 sm:bg-white/95 border-2 border-[#C8A66A] text-[#B8863B] hover:bg-[#F6F5F2] hover:scale-105 active:scale-95 shadow-md transition-all duration-300 group focus:outline-none cursor-pointer"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <button
              onClick={() => setCurrentHeroSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-[35%] sm:top-1/2 -translate-y-1/2 sm:right-4 z-20 w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/90 sm:bg-white/95 border-2 border-[#C8A66A] text-[#B8863B] hover:bg-[#F6F5F2] hover:scale-105 active:scale-95 shadow-md transition-all duration-300 group focus:outline-none cursor-pointer"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </>
        )}

        {/* Manual Slideshow Triggers */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5 items-center">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHeroSlide(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  currentHeroSlide === idx ? 'bg-[#C8A66A] w-4' : 'bg-white/40 w-1.5'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

          {/* 2.5 INSTAGRAM STORIES HIGHLIGHTS SECTION (REALOCANDO LOGO ABAIXO DO HERO BANNER) */}
          <section id="instagram-story-highlights" className="py-6 sm:py-8 bg-[#F6F5F2] border-b border-stone-200/50 relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              
              {/* Seta para esquerda no desktop e mobile */}
              <button 
                type="button"
                onClick={() => scrollHighlights('left')}
                className="absolute left-2 top-12 sm:top-14 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xs border border-stone-200 text-[#B8863B] hover:bg-white hover:scale-105 active:scale-95 shadow-md flex items-center justify-center cursor-pointer transition-all animate-pulse-subtle"
                aria-label="Voltar categorias"
              >
                <ChevronLeft className="w-5.5 h-5.5" />
              </button>

              {/* Seta para direita no desktop e mobile */}
              <button 
                type="button"
                onClick={() => scrollHighlights('right')}
                className="absolute right-2 top-12 sm:top-14 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xs border border-stone-200 text-[#B8863B] hover:bg-white hover:scale-105 active:scale-95 shadow-md flex items-center justify-center cursor-pointer transition-all animate-pulse-subtle"
                aria-label="Avançar categorias"
              >
                <ChevronRight className="w-5.5 h-5.5" />
              </button>

              <div 
                ref={highlightsScrollRef}
                className="flex overflow-x-auto gap-4 sm:gap-6 py-3 px-12 sm:px-16 md:px-20 lg:px-24 xl:px-12 justify-start xl:justify-center snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {[
                  {
                    topic: 'Todos',
                    title: 'Ver Tudo',
                    image: 'https://i.postimg.cc/1Xf8vVqG/caneca-branca-personalizada.webp',
                    anchorId: 'shop-all-sections'
                  },
                  {
                    topic: 'Divertidíssimas',
                    title: 'Divertidas',
                    image: 'https://i.postimg.cc/G21gcM96/caneca-risotril-personalizada-remedio.webp',
                    anchorId: 'section-divertidas'
                  },
                  {
                    topic: 'Signos & Astrologia',
                    title: 'Signos',
                    image: 'https://i.postimg.cc/TY9KQhry/caneca-personalizada-signo-de-gemeos.webp',
                    anchorId: 'section-mais-vendidos'
                  },
                  {
                    topic: 'Animes & Desenhos',
                    title: 'Geek & Anime',
                    image: 'https://i.postimg.cc/s2qFr9R2/caneca-personalizada-naruto.webp',
                    anchorId: 'section-mais-vendidos'
                  },
                  {
                    topic: 'Mãe Especial',
                    title: 'Mãe Especial',
                    image: 'https://i.postimg.cc/SR2X9crG/caneca-maezona-personalizada.jpg',
                    anchorId: 'section-destaques'
                  },
                  {
                    topic: 'Com Foto',
                    title: 'Com Foto',
                    image: 'https://i.postimg.cc/zvHkKKLw/caneca-personalizada-com-foto.webp',
                    anchorId: 'section-comfoto'
                  },
                  {
                    topic: 'Metalizadas',
                    title: 'Metalizadas',
                    image: 'https://i.postimg.cc/P54P60hs/caneca-dourada-e-rosa-metalica-personalizada.webp',
                    anchorId: 'section-destaques'
                  },
                  {
                    topic: 'Mágicas',
                    title: 'Mágicas',
                    image: 'https://i.postimg.cc/rmZDcHwN/caneca-personalizada-magica.webp',
                    anchorId: 'section-destaques'
                  },
                  {
                    topic: 'Fé & Inspiração',
                    title: 'Fé & Motivação',
                    image: 'https://i.postimg.cc/K8hyK5Kf/caneca-personalizada-fe-foco-forca.webp',
                    anchorId: 'section-destaques'
                  },
                  {
                    topic: 'Corporativo & Atacado',
                    title: 'Corp. & Atacado',
                    image: 'https://i.postimg.cc/CKHMMQmh/caneca-personalizada-para-empresas-e-atacado.webp',
                    anchorId: 'section-comfoto'
                  },
                  {
                    topic: 'Kits & Modelos Especiais',
                    title: 'Kits Especiais',
                    image: 'https://i.postimg.cc/VNhZ3fPx/xicaras-personalizadas-kit-com-4-xicaras.webp',
                    anchorId: 'section-destaques'
                  },
                  {
                    topic: 'Afeto, Fé & Música',
                    title: 'Música & Pop',
                    image: 'https://i.postimg.cc/Sx2MgkVg/caneca-personalizada-michael-jackson.webp',
                    anchorId: 'section-musica'
                  }
                ].map((cat) => {
                  return (
                    <div 
                      key={cat.topic}
                      className="flex flex-col items-center flex-shrink-0 snap-center cursor-pointer group"
                      onClick={() => {
                        setSelectedSuccessTopic(cat.topic);
                        const element = document.getElementById(cat.anchorId);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      <div className="relative transition-all duration-300 transform group-hover:scale-105 active:scale-95">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 p-[3px] rounded-full transition-all duration-300 bg-stone-300 hover:from-[#B8863B] hover:to-[#C8A66A] bg-white shadow-xs">
                          <div className="w-full h-full p-0.5 bg-white rounded-full">
                            <img 
                              src={cat.image} 
                              alt={cat.title} 
                              className="w-full h-full object-cover rounded-full border border-stone-200/40"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] sm:text-xs font-semibold text-center mt-2 tracking-tight transition-colors truncate max-w-[84px] sm:max-w-[100px] p-0.5 text-stone-700 font-medium group-hover:text-stone-900">
                        {cat.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 2.5.5 PROMO BANNERS SECUNDÁRIOS EM DUPLA (BANNERS MENORES LADO A LADO EM MOBILE E DESKTOP) */}
          <section className="py-2.5 sm:py-4 bg-[#F6F5F2] px-3 sm:px-6 lg:px-8 border-b border-stone-200/40">
            <div className="max-w-7xl mx-auto grid grid-cols-2 gap-2.5 sm:gap-6">
              
              {/* Banner 1: Caneca Atacado */}
              <div 
                onClick={() => handleWhatsAppRedirect({
                  type: 'Atacado',
                  sub: 'Tenho interesse em orçamento de canecas personalizadas no atacado'
                })}
                className="relative rounded-lg sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-stone-200/60 bg-white group cursor-pointer transition-all duration-300 hover:scale-[1.015] aspect-[1.8/1] w-full"
              >
                <img 
                  src="https://i.postimg.cc/mDks10Jh/canecas-personalizadas-no-atacado.webp" 
                  alt="Atacado de Canecas Corporativas"
                  className="w-full h-full object-cover block group-hover:scale-[1.02] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Banner 2: Caneca Mágica */}
              <div 
                onClick={() => {
                  const idx = availableMugs.findIndex(m => m.title === 'Caneca Mágica');
                  setSelectedAvailableMugIndex(idx !== -1 ? idx : 7);
                }}
                className="relative rounded-lg sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-stone-200/60 bg-white group cursor-pointer transition-all duration-300 hover:scale-[1.015] aspect-[1.8/1] w-full"
              >
                <img 
                  src="https://i.postimg.cc/L6wMbgFx/caneca-magica-personalizada-banner-vitrine.webp" 
                  alt="Caneca Mágica Revelável"
                  className="w-full h-full object-cover block group-hover:scale-[1.02] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>
          </section>

      {/* SEÇÃO DO CATÁLOGO DE CANECAS EM BLOCOS CATEGORIZADOS (IGUAL AO SITE MODELO - 3 CANECAS EM GRID POR LINHA) */}
      <section id="catalogo" className="py-2 bg-[#F6F5F2] relative z-20">
        <div id="shop-all-sections" className="w-full relative">
          {searchTerm ? (
            /* RESULTADO DE BUSCA SE SEARCHTERM ATIVO */
            <div className="py-12 bg-[#F6F5F2] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="font-display font-medium text-2xl sm:text-3xl text-stone-900">
                    Resultados de: <span className="text-[#B8863B]">"{searchTerm}"</span>
                  </h2>
                  <p className="text-xs text-stone-500 font-medium mt-1">
                    Encontramos estas opções exclusivas para você
                  </p>
                </div>

                {(() => {
                  const filtered = galleryItems.filter(item => 
                    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    item.tagline.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
                        <span className="text-3xl">🔍</span>
                        <h3 className="text-sm font-bold text-stone-700 mt-2">Nenhuma caneca encontrada</h3>
                        <p className="text-xs text-stone-400 mt-1">Tente pesquisar com outras palavras como "Flork" ou "Mãe".</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {filtered.map((item, idx) => {
                        const itemPrice = getProductPrice(item.title);
                        return (
                          <div 
                            key={`search-item-${idx}`}
                            className="bg-white rounded-2xl overflow-hidden shadow-xs border border-stone-200 hover:border-[#B8863B]/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full"
                          >
                            <div 
                              onClick={() => {
                                const originalIdx = galleryItems.findIndex(g => g.title === item.title);
                                setSelectedGalleryIndex(originalIdx !== -1 ? originalIdx : 0);
                                setActiveTab('detalhes');
                              }}
                              className="relative aspect-square overflow-hidden bg-stone-50 cursor-pointer"
                            >
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between text-left">
                              <div className="cursor-pointer" onClick={() => {
                                const originalIdx = galleryItems.findIndex(g => g.title === item.title);
                                setSelectedGalleryIndex(originalIdx !== -1 ? originalIdx : 0);
                                setActiveTab('detalhes');
                              }}>
                                <h3 className="font-display font-medium text-stone-900 text-xs sm:text-sm lg:text-base leading-tight truncate">
                                  {item.title}
                                </h3>
                              </div>
                              <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex flex-col">
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                  {itemPrice === 5.00 ? (
                                    <span className="text-xs sm:text-sm font-black text-[#5E6D5F]">
                                      R$ 5,00
                                    </span>
                                  ) : (
                                    <>
                                      <span className="text-xs sm:text-sm font-black text-[#5E6D5F]">
                                        R$ {(itemPrice * 0.9).toFixed(2).replace('.', ',')}
                                      </span>
                                      <span className="text-[10px] text-stone-400 line-through">
                                        R$ {itemPrice.toFixed(2).replace('.', ',')}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {itemPrice !== 5.00 && (
                                  <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold mt-0.5">
                                    ✓ Pix 10% Desconto
                                  </span>
                                )}

                                <div className="grid grid-cols-2 gap-1.5 mt-3 text-[10px]">
                                  <button
                                    onClick={() => buyInteractive({
                                      title: item.title,
                                      image: item.image,
                                      originalIndex: galleryItems.findIndex(g => g.title === item.title)
                                    })}
                                    className="py-1.5 bg-[#0b2b22] hover:bg-emerald-750 text-white font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-none"
                                    title="Adicionar ao Carrinho"
                                  >
                                    <span>+ Carrinho</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      const prodIdx = galleryItems.findIndex(g => g.title === item.title);
                                      const cartItemToAdd = {
                                        title: item.title,
                                        image: item.image,
                                        qty: 1,
                                        originalIndex: prodIdx !== -1 ? prodIdx : 0
                                      };
                                      setCartItems(prev => {
                                        if (prev.some(i => i.title === item.title)) return prev;
                                        return [...prev, cartItemToAdd];
                                      });
                                      
                                      setActiveCheckoutLink('cart-unified-checkout');
                                      setActiveCheckoutName('Coleção de Canecas Escolhidas');
                                      setActiveCheckoutImage(item.image);
                                      setActiveCheckoutIframeLoading(false);
                                      setCustPaymentMethod('pix_pushin');
                                      setCheckoutStep(1);
                                      setActiveTab('checkout');
                                    }}
                                    className="py-1.5 bg-gradient-to-r from-amber-500 to-[#B8863B] text-white font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-none"
                                    title="Comprar Agora"
                                  >
                                    <span>🛒 Comprar</span>
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleWhatsAppRedirect({
                                    type: 'Produto',
                                    text: item.title
                                  })}
                                  className="w-full mt-1.5 py-1.5 bg-[#25D366] hover:brightness-105 text-white font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-none"
                                >
                                  <span>Chamar no Whats</span>
                                  <span>💬</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* SEÇÃO DE CADA SESSÃO DE CANECAS ATE EM BAIXO (EXATAMENTE 3 POR LINHA NO DESKTOP, CARDS MAIORES) */
              <div className="flex flex-col">
                {[
                  {
                    id: 'section-destaques',
                    title: 'Destaques',
                    tagline: 'O melhor do nosso catálogo feito especialmente para você',
                    badge: 'DESTAQUES DO DIA 🔥',
                    bg: 'bg-white',
                    items: [
                      {
                        title: 'Caneca Maezona',
                        tagline: 'Homenagem especial com carinho e cores vibrantes para a melhor mãe.',
                        image: 'https://i.postimg.cc/SR2X9crG/caneca-maezona-personalizada.jpg',
                        badge: 'Mãe Especial'
                      },
                      {
                        title: 'Caneca com Colher',
                        tagline: 'Design elegante com colher integrada para combinar praticidade e estilo.',
                        image: 'https://i.postimg.cc/6316sN1x/caneca-com-colher-personalizada-branca-e-preta.webp',
                        badge: 'Com Colher'
                      },
                      {
                        title: 'Canecas Metálicas',
                        tagline: 'O brilho sofisticado e acabamento premium em dourado e rosa metalizado.',
                        image: 'https://i.postimg.cc/P54P60hs/caneca-dourada-e-rosa-metalica-personalizada.webp',
                        badge: 'Metalizada'
                      },
                      {
                        title: 'Você Pode Tudo',
                        tagline: 'Uma mensagem motivadora e inspiradora para começar todos os dias com positividade.',
                        image: 'https://i.postimg.cc/d0DZhvZT/caneca-personalizada-voce-pode-tudo.webp',
                        badge: 'Motivacional'
                      }
                    ]
                  },
                  {
                    id: 'section-mais-vendidos',
                    title: 'Mais Vendidos',
                    tagline: 'As canecas mais amadas e escolhidas pelos nossos clientes',
                    badge: 'MAIS VENDIDOS DO BRASIL ⭐',
                    bg: 'bg-[#F6F5F2]',
                    items: [
                      {
                        title: 'Dragon Ball Z',
                        tagline: 'O poder saiyajin em uma estampa vibrante e cheia de ação.',
                        image: 'https://i.postimg.cc/j21jfnpG/canecas-personalizada-dragon-ball.webp',
                        badge: 'Anime'
                      },
                      {
                        title: 'Caneca Naruto',
                        tagline: 'O espírito ninja de Konoha estampado em uma caneca vibrante e cheia de determinação.',
                        image: 'https://i.postimg.cc/s2qFr9R2/caneca-personalizada-naruto.webp',
                        badge: 'Anime & Naruto'
                      },
                      {
                        title: 'Poderosa Chefona',
                        tagline: 'Mostre quem está no comando com muito estilo, atitude e bom humor.',
                        image: 'https://i.postimg.cc/D01BR176/caneca-personalizada-poderosa-chefona.webp',
                        badge: 'Empoderada'
                      },
                      {
                        title: 'Signo de Gêmeos',
                        tagline: 'Leve toda a versatilidade, inteligência e o charme do Zodíaco para o seu café.',
                        image: 'https://i.postimg.cc/TY9KQhry/caneca-personalizada-signo-de-gemeos.webp',
                        badge: 'Zodíaco'
                      }
                    ]
                  },
                  {
                    id: 'section-divertidas',
                    title: 'Divertidas',
                    tagline: 'Comece as manhãs com sorrisos, alto astral e boas risadas',
                    badge: 'HUMOR & RISO 😁',
                    bg: 'bg-white',
                    items: [
                      {
                        title: 'Caneca Risotril',
                        tagline: 'Dose diária de bom humor com a criativa embalagem de remédio personalizada.',
                        image: 'https://i.postimg.cc/G21gcM96/caneca-risotril-personalizada-remedio.webp',
                        badge: 'Divertida Remedinho'
                      },
                      {
                        title: 'Caneca Foda-se',
                        tagline: 'A dose diária de tranquilidade e bom humor que você precisa para encarar o dia leve.',
                        image: 'https://i.postimg.cc/hjWm66hS/caneca-personalizada-fodas-remedio.webp',
                        badge: 'Humor Sincero'
                      },
                      {
                        title: 'É Café, mas podia ser...',
                        tagline: 'A verdade sincera estampada com muita diversão para descontrair na hora do café.',
                        image: 'https://i.postimg.cc/9M5xbxhg/caneca-personalizada-e-cafe-mas-podia-ser-cerveja.webp',
                        badge: 'Best Seller 🍻'
                      },
                      {
                        title: 'Caneca Café Remédio',
                        tagline: 'A dose diária de cafeína prescrita com muito humor e diversão para revitalizar.',
                        image: 'https://i.postimg.cc/52JLsZYw/caneca-personalizada-cafe-remedio.webp',
                        badge: 'Cafeína Diária 💊'
                      }
                    ]
                  },
                  {
                    id: 'section-musica',
                    title: 'Canecas com Música',
                    tagline: 'Seus cantores favoritos e códigos Spotify para ouvir quando quiser',
                    badge: 'MÚSICA & RITMO 🎵',
                    bg: 'bg-[#F6F5F2]',
                    items: [
                      {
                        title: 'Michael Jackson',
                        tagline: 'Uma linda homenagem de fã ao eterno Rei do Pop com design impecável.',
                        image: 'https://i.postimg.cc/Sx2MgkVg/caneca-personalizada-michael-jackson.webp',
                        badge: 'Rei do Pop'
                      },
                      {
                        title: 'Tributo Michael Jackson',
                        tagline: 'Uma homenagem digna ao Rei do Pop para embalar seu café com nostalgia.',
                        image: 'https://i.postimg.cc/Pqn0xfRQ/caneca-personalizada-michael-jackson-tributo.webp',
                        badge: 'Música & Nostalgia'
                      },
                      {
                        title: 'Caneca Playlist do Amor',
                        tagline: 'Personalizada com código Spotify escaneável da sua música ou playlist favorita.',
                        image: 'https://i.postimg.cc/zvHkKKLw/caneca-personalizada-com-foto.webp',
                        badge: 'Spotify Escaneável 📱'
                      },
                      {
                        title: 'Caneca Ritmo Perfeito',
                        tagline: 'Tema de pautas musicais e instrumentos para amantes de uma boa canção.',
                        image: 'https://i.postimg.cc/6316sN1x/caneca-com-colher-personalizada-branca-e-preta.webp',
                        badge: 'Melodias'
                      }
                    ]
                  },
                  {
                    id: 'section-comfoto',
                    title: 'Caneca com Foto',
                    tagline: 'Eternize rostos, momentos ou a sua arte exclusiva com alta resolução',
                    badge: 'TOTALMENTE SUA 📸',
                    bg: 'bg-white',
                    items: [
                      {
                        title: 'Caneca com Foto',
                        tagline: 'Eternize os seus melhores momentos e recordações mais queridas em uma linda caneca.',
                        image: 'https://i.postimg.cc/zvHkKKLw/caneca-personalizada-com-foto.webp',
                        badge: 'Sua Recordação'
                      },
                      {
                        title: 'Caneca Desenhos Infantis',
                        tagline: 'Guarde as artes desenhadas pelos seus filhos estampadas para sempre na caneca.',
                        image: 'https://i.postimg.cc/sDNbS4vk/canecas-personalizadas-desenhos-infantis.webp',
                        badge: 'Desenho de Filho 👶'
                      },
                      {
                        title: 'Personalizada Fernanda',
                        tagline: 'Seu nome envolvido por delicadas flores em um design exclusivo e encantador.',
                        image: 'https://i.postimg.cc/G3j3nV9N/caneca-personalizada-fernanda.webp',
                        badge: 'Acabamento Floral 🌺'
                      },
                      {
                        title: 'Corporativa & Atacado',
                        tagline: 'Destaque sua marca com o logotipo da sua empresa ou faça encomendas para brindes.',
                        image: 'https://i.postimg.cc/CKHMMQmh/caneca-personalizada-para-empresas-e-atacado.webp',
                        badge: 'Brindes Corporativos 🏢'
                      }
                    ]
                  },
                  {
                    id: 'section-time',
                    title: 'Caneca de Time',
                    tagline: 'Leve a bandeira e as cores do seu time do coração na hora do café',
                    badge: 'TORCIDA GERAL 🏆',
                    bg: 'bg-[#F6F5F2]',
                    items: [
                      {
                        title: 'Caneca de Futebol Copa do Mundo',
                        tagline: 'Torça pela seleção com estilo! Canecas personalizadas com seu nome e número.',
                        image: 'https://i.postimg.cc/NjBDX51p/copa-do-mundo-canecas-quality.jpg',
                        badge: 'Brasil do Peito ⚽'
                      },
                      {
                        title: 'Caneca Time Campeão',
                        tagline: 'Leve a glória do seu time do coração para o escritório e mostre seu orgulho.',
                        image: 'https://i.postimg.cc/1Xf8vVqG/caneca-branca-personalizada.webp',
                        badge: 'Futebol Clássico'
                      },
                      {
                        title: 'Caneca do Seu Time',
                        tagline: 'Totalmente personalizada com o brasão e as cores oficiais da sua maior paixão.',
                        image: 'https://i.postimg.cc/N0BLWzHW/caneca-preta-personalizada.webp',
                        badge: 'Time do Coração'
                      },
                      {
                        title: 'Caneca Camisa 10',
                        tagline: 'Seu nome e número favoritos estampados na camisa do clube que você mais torce.',
                        image: 'https://i.postimg.cc/qqs5ZwC1/caneca-dourada-metalizada-personalizada.webp',
                        badge: 'Manto Sagrado'
                      }
                    ]
                  },
                  {
                    id: 'section-namorados',
                    title: 'Dia dos Namorados',
                    tagline: 'Presentes românticos perfeitos para celebrar o amor e a união',
                    badge: 'ESPECIAL DOS NAMORADOS 💖',
                    bg: 'bg-white',
                    items: [
                      {
                        title: 'Caneca Casal Eterno',
                        tagline: 'Lúdico design de casal que se complementa perfeitamente para presentes românticos.',
                        image: 'https://i.postimg.cc/6QczhRVs/dia-dos-namorados-canecas-personalizadas-quality.jpg',
                        badge: 'Par de Casal'
                      },
                      {
                        title: 'Caneca Namorados com Fotos',
                        tagline: 'Seus melhores momentos românticos e recordações de casal em alta definição.',
                        image: 'https://i.postimg.cc/zvHkKKLw/caneca-personalizada-com-foto.webp',
                        badge: 'Amor & Recordação'
                      },
                      {
                        title: 'Caneca Alça Coração Romântica',
                        tagline: 'Alça charmosa em formato de coração que confere romance ao presente de casal.',
                        image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=600',
                        badge: 'Alça Coração'
                      },
                      {
                        title: 'Caneca Amor em Versos',
                        tagline: 'Uma linda carta de amor estampada com elegância para encantar quem compartilha a vida com você.',
                        image: 'https://i.postimg.cc/d0DZhvZT/caneca-personalizada-voce-pode-tudo.webp',
                        badge: 'Para Sempre Amor'
                      }
                    ]
                  }
                ].map((sec) => (
                  <div 
                    key={sec.id}
                    id={sec.id}
                    className={`py-12 sm:py-16 ${sec.bg} border-b border-stone-200/50 scroll-mt-24`}
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      
                      {/* Section Title Header */}
                      <div className="mb-6 sm:mb-8 text-left">
                        <h2 className="font-display font-medium text-2xl sm:text-3xl text-stone-900 tracking-tight">
                          {sec.title}
                        </h2>
                      </div>

                      {/* Product display grid containing exactly 4 mugs side-by-side */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {sec.items.map((item, idx) => {
                          const basePrice = getProductPrice(item.title);
                          const originalItemIdx = galleryItems.findIndex(g => g.title === item.title);
                          
                          return (
                            <div 
                              key={`${sec.id}-item-${idx}`}
                              className="bg-white rounded-2xl overflow-hidden shadow-xs border border-stone-200 hover:border-[#B8863B]/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group"
                            >
                              {/* Thumbnail with custom scale on hover */}
                              <div 
                                onClick={() => {
                                  setSelectedGalleryIndex(originalItemIdx !== -1 ? originalItemIdx : 0);
                                  setActiveTab('detalhes');
                                }}
                                className="relative aspect-square overflow-hidden bg-stone-50 cursor-pointer"
                              >
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                                {item.badge && (
                                  <span className="absolute top-2.5 left-2.5 bg-neutral-900/85 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs font-sans">
                                    {item.badge}
                                  </span>
                                )}
                              </div>

                              {/* Card Content details */}
                              <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between text-left">
                                <div 
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setSelectedGalleryIndex(originalItemIdx !== -1 ? originalItemIdx : 0);
                                    setActiveTab('detalhes');
                                  }}
                                >
                                  <h3 className="font-display font-medium text-stone-900 text-sm sm:text-base lg:text-lg leading-tight mt-1 truncate group-hover:text-[#B8863B] transition-colors">
                                    {item.title}
                                  </h3>
                                </div>

                                {/* Price Tags */}
                                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col">
                                  <div className="flex items-baseline gap-1.5 flex-wrap">
                                    {basePrice === 5.00 ? (
                                      <span className="text-sm sm:text-base font-black text-[#5E6D5F]">
                                        R$ 5,00
                                      </span>
                                    ) : (
                                      <>
                                        <span className="text-sm sm:text-base font-black text-[#5E6D5F]">
                                          R$ {(basePrice * 0.9).toFixed(2).replace('.', ',')}
                                        </span>
                                        <span className="text-[11px] text-stone-400 line-through">
                                          R$ {basePrice.toFixed(2).replace('.', ',')}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <div className="flex flex-col text-[10px] mt-1 font-medium font-sans">
                                    {basePrice !== 5.00 && (
                                      <span className="text-emerald-600 font-bold">✓ Pix 10% Desconto</span>
                                    )}
                                    <span className="text-stone-500">Ou 12x de R$ {(basePrice / 12 * 1.15).toFixed(2).replace('.', ',')} sem juros</span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 mt-4 font-sans text-xs">
                                    <button
                                      onClick={() => buyInteractive({
                                        title: item.title,
                                        image: item.image,
                                        originalIndex: originalItemIdx !== -1 ? originalItemIdx : 0
                                      })}
                                      className="py-2 bg-[#0b2b22] hover:bg-emerald-700 text-white font-black text-[10px] uppercase rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-none shadow-xs"
                                      title="Adicionar ao Carrinho"
                                    >
                                      <span>+ Carrinho</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const cartItemToAdd = {
                                          title: item.title,
                                          image: item.image,
                                          qty: 1,
                                          originalIndex: originalItemIdx !== -1 ? originalItemIdx : 0
                                        };
                                        setCartItems(prev => {
                                          if (prev.some(i => i.title === item.title)) return prev;
                                          return [...prev, cartItemToAdd];
                                        });
                                        
                                        setActiveCheckoutLink('cart-unified-checkout');
                                        setActiveCheckoutName('Coleção de Canecas Escolhidas');
                                        setActiveCheckoutImage(item.image);
                                        setActiveCheckoutIframeLoading(false);
                                        setCustPaymentMethod('pix_pushin');
                                        setCheckoutStep(1);
                                        setActiveTab('checkout');
                                      }}
                                      className="py-2 bg-gradient-to-r from-amber-500 to-[#B8863B] text-white font-black text-[10px] uppercase rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-none shadow-xs"
                                      title="Comprar Agora (Checkout Direto)"
                                    >
                                      <span>🛒 Comprar</span>
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => handleWhatsAppRedirect({
                                      type: 'Produto',
                                      text: item.title
                                    })}
                                    className="w-full mt-2 py-2 bg-[#25D366] hover:brightness-105 text-white font-black text-[10px] uppercase rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-none shadow-xs"
                                  >
                                    <span>Chamar no Whats</span>
                                    <span>💬</span>
                                  </button>
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      {/* 3. SESSÃO BENEFÍCIOS (ROTACIONADA PARA O FINAL DAS SEÇÕES, LOGO ABAIXO DO CATÁLOGO GERAL) */}
      <section id="beneficios" className="py-6 sm:py-8 bg-white border-y border-stone-200/50 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* DESKTOP BENEFÍCIOS */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-y-3.5 gap-x-2 lg:gap-0 lg:divide-x lg:divide-stone-200">
            
            <div id="card-beneficio-1-res" className="flex items-center gap-1.5 sm:gap-3 px-1 sm:px-4 lg:px-6 justify-center">
              <div className="flex-shrink-0 text-[#B8863B]">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-[#B8863B] text-[11px] min-[360px]:text-xs sm:text-[13px] md:text-sm lg:text-[15px] xl:text-base tracking-tight font-sans">
                  Entregamos para todo Brasil
                </span>
                <span className="text-gray-500 font-semibold text-[9px] min-[360px]:text-[10px] sm:text-[11px] md:text-xs lg:text-[13px] leading-tight mt-0.5 font-sans">
                  Embalagem reforçada
                </span>
              </div>
            </div>

            <div id="card-beneficio-2-res" className="flex items-center gap-1.5 sm:gap-3 px-1 sm:px-4 lg:px-6 justify-center">
              <div className="flex-shrink-0 text-[#B8863B]">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-[#B8863B] text-[11px] min-[360px]:text-xs sm:text-[13px] md:text-sm lg:text-[15px] xl:text-base tracking-tight font-sans">
                  Parcelamento
                </span>
                <span className="text-gray-500 font-semibold text-[9px] min-[360px]:text-[10px] sm:text-[11px] md:text-xs lg:text-[13px] leading-tight mt-0.5 font-sans">
                  No cartão de crédito
                </span>
              </div>
            </div>

            <div id="card-beneficio-3-res" className="flex items-center gap-1.5 sm:gap-3 px-1 sm:px-4 lg:px-6 justify-center">
              <div className="flex-shrink-0 text-[#B8863B]">
                <Award className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-[#B8863B] text-[11px] min-[360px]:text-xs sm:text-[13px] md:text-sm lg:text-[15px] xl:text-base tracking-tight font-sans">
                  Ganhe Desconto
                </span>
                <span className="text-gray-500 font-semibold text-[9px] min-[360px]:text-[10px] sm:text-[11px] md:text-xs lg:text-[13px] leading-tight mt-0.5 font-sans">
                  No PIX
                </span>
              </div>
            </div>

            <div id="card-beneficio-4-res" className="flex items-center gap-1.5 sm:gap-3 px-1 sm:px-4 lg:px-6 justify-center">
              <div className="flex-shrink-0 text-[#B8863B]">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-[#B8863B] text-[11px] min-[360px]:text-xs sm:text-[13px] md:text-sm lg:text-[15px] xl:text-base tracking-tight font-sans">
                  Segurança
                </span>
                <span className="text-gray-500 font-semibold text-[9px] min-[360px]:text-[10px] sm:text-[11px] md:text-xs lg:text-[13px] leading-tight mt-0.5 font-sans">
                  Ambiente seguro
                </span>
              </div>
            </div>

          </div>

          {/* MOBILE CAROUSEL */}
          <div className="block sm:hidden relative w-full h-[54px] flex items-center justify-center select-none overflow-hidden">
            <button 
              onClick={() => setCurrentBenefitSlide((prev) => (prev === 0 ? 3 : prev - 1))}
              className="absolute left-1 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-stone-50 border border-[#EFECE6] text-[#B8863B]"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[80%] h-full flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                {currentBenefitSlide === 0 && (
                  <motion.div
                    key="benefit-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-x-0 h-full flex items-center justify-center gap-3"
                  >
                    <Truck className="h-6 w-6 text-[#B8863B]" />
                    <div className="flex flex-col text-left leading-tight">
                      <span className="font-bold text-[#B8863B] text-sm tracking-tight font-sans">Entregamos para todo Brasil</span>
                      <span className="text-gray-500 text-xs mt-0.5">Embalagem reforçada</span>
                    </div>
                  </motion.div>
                )}
                {currentBenefitSlide === 1 && (
                  <motion.div
                    key="benefit-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-x-0 h-full flex items-center justify-center gap-3"
                  >
                    <CreditCard className="h-6 w-6 text-[#B8863B]" />
                    <div className="flex flex-col text-left leading-tight font-sans">
                      <span className="font-bold text-[#B8863B] text-sm tracking-tight font-sans">Parcelamento</span>
                      <span className="text-gray-500 text-xs mt-0.5 font-sans">No cartão de crédito</span>
                    </div>
                  </motion.div>
                )}
                {currentBenefitSlide === 2 && (
                  <motion.div
                    key="benefit-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-x-0 h-full flex items-center justify-center gap-3"
                  >
                    <Award className="h-6 w-6 text-[#B8863B]" />
                    <div className="flex flex-col text-left leading-tight">
                      <span className="font-bold text-[#B8863B] text-sm tracking-tight font-sans font-black">Ganhe Desconto</span>
                      <span className="text-gray-500 text-xs mt-0.5">No PIX</span>
                    </div>
                  </motion.div>
                )}
                {currentBenefitSlide === 3 && (
                  <motion.div
                    key="benefit-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-x-0 h-full flex items-center justify-center gap-3"
                  >
                    <Lock className="h-6 w-6 text-[#B8863B]" />
                    <div className="flex flex-col text-left leading-tight">
                      <span className="font-bold text-[#B8863B] text-sm tracking-tight font-sans">Segurança</span>
                      <span className="text-gray-500 text-xs mt-0.5">Ambiente seguro</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => setCurrentBenefitSlide((prev) => (prev === 3 ? 0 : prev + 1))}
              className="absolute right-1 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-stone-50 border border-[#EFECE6] text-[#B8863B]"
              aria-label="Próxima"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================== */}
      
      {/* 4. SESSÃO MAIS VENDIDOS (COM PRODUTOS E CLIQUE PARA ZOOM DETALHE) */}
      <section id="mais-vendidos" className="py-12 bg-[#F6F5F2] border-[#EFECE6]/80 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2B2B2B] mt-1 relative inline-block">
              Mais vendidos
              <div className="w-16 h-1 bg-[#B8863B] mx-auto mt-2 rounded" />
            </h2>
          </div>

          {/* CAROUSEL CONTAINER WITH CONTROLS */}
          <div className="relative max-w-5xl mx-auto px-4 sm:px-12 group/carousel">
            
            {/* Left Control Button */}
            <button
              onClick={() => scrollMaisVendidos('left')}
              className="absolute -left-2 sm:left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/95 border border-[#EFECE6] text-[#B8863B] shadow-md hover:bg-stone-50 active:scale-95 transition-all duration-300 focus:outline-none cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Carousel track */}
            <div
              ref={maisVendidosRef}
              className="overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth flex gap-3 sm:gap-4 lg:gap-6 py-2 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {galleryItems.map((item, idx) => {
                const itemPrice = getProductPrice(item.title);
                const formattedPrice = itemPrice.toFixed(2).replace('.', ',');
                const installments = `${(itemPrice / 12 * 1.15).toFixed(2).replace('.', ',')}`;
                const pixHighlight = `${(itemPrice * 0.95).toFixed(2).replace('.', ',')}`;

                return (
                  <div
                    key={`mais-vendido-${item.title}-${idx}`}
                    className="w-[calc(50%-6px)] md:w-[calc(25%-18px)] flex-shrink-0 snap-start h-full"
                  >
                    <div
                      className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#EFECE6] hover:border-[#C8A66A] hover:shadow-lg transition-all duration-300 group cursor-pointer relative flex flex-col justify-between h-full"
                      onClick={() => setSelectedGalleryIndex(idx)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-stone-150 flex items-center justify-center flex-shrink-0 w-full">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Badge */}
                        <span className="absolute top-2 left-2 bg-[#B8863B]/95 backdrop-blur-xs text-white text-[7px] sm:text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-xs z-10">
                          {item.badge}
                        </span>

                        {/* Zoom trigger hover */}
                        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white/95 text-stone-900 text-[9px] font-semibold px-2.5 py-1 rounded-full shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            Ver Detalhes 🔍
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 text-left flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-display font-extrabold text-[11px] sm:text-xs text-[#2B2B2B] leading-tight group-hover:text-[#B8863B] transition-colors line-clamp-1 h-3.5 sm:h-4 flex items-center" title={item.title}>
                            {item.title}
                          </h3>

                          {/* Espaço do preço e valor como loja real */}
                          <div className="mt-2 space-y-0.5 border-t border-stone-100 pt-2 pb-1 min-h-[56px] sm:min-h-[64px] flex flex-col justify-center">
                            <div className="font-sans font-extrabold text-xs sm:text-sm text-stone-900 leading-none">
                              R$ {formattedPrice}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-stone-500 leading-none">
                              12x de R$ {installments}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-[#25D366] font-extrabold leading-none">
                              R$ {pixHighlight} com Pix
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGalleryIndex(idx);
                          }}
                          className="mt-2 w-full py-1.5 bg-[#627263] hover:bg-[#506051] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-md transition-all text-center flex items-center justify-center gap-1 cursor-pointer border-none shadow-xs h-7 sm:h-8"
                        >
                          <span>Comprar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Control Button */}
            <button
              onClick={() => scrollMaisVendidos('right')}
              className="absolute -right-2 sm:right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/95 border border-[#EFECE6] text-[#B8863B] shadow-md hover:bg-stone-50 active:scale-95 transition-all duration-300 focus:outline-none cursor-pointer"
              aria-label="Próxima"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

          </div>

        </div>
      </section>

      {/* 5. PROPAGANDA (CANECA IMPrERIAL E CANECA DOURADA + CANECA ATACADO HORIZONTAL) */}
      <section id="propaganda-imperial-branca" className="py-6 bg-[#F6F5F2] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

            {/* Título de Chamada para Atacado e Revenda */}
            <div className="text-center py-2 px-1 max-w-3xl mx-auto space-y-3 sm:space-y-4 relative overflow-hidden">
              {/* Estilo local para animação de marquee infinito no mobile e pulsação chamativa do texto */}
              <style>{`
                @keyframes marqueeMobile {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .marquee {
                  display: flex;
                  width: max-content;
                  gap: 12px;
                  animation: marqueeMobile 14s linear infinite;
                }
                @keyframes continuousPulse {
                  0%, 100% {
                    transform: scale(1);
                    text-shadow: 0 0 0px rgba(184, 134, 59, 0);
                  }
                  50% {
                    transform: scale(1.025);
                    text-shadow: 0 1px 10px rgba(184, 134, 59, 0.25);
                  }
                }
                .attention-pulse-interactive {
                  animation: continuousPulse 2.4s infinite ease-in-out;
                  display: inline-block;
                  will-change: transform;
                }
              `}</style>

              <div className="attention-pulse-interactive cursor-default">
                <p className="text-[#5C554E] font-bold text-[16px] min-[360px]:text-[18px] sm:text-[20px] md:text-[22px] leading-relaxed tracking-wide uppercase">
                  Atacado para revenda. <span className="text-[#B8863B] font-extrabold">Solicite um orçamento</span>
                </p>
              </div>
              
              {/* MOBILE BADGES: INFINITE ENDLESS SLIDING MARQUEE */}
              <div className="block sm:hidden overflow-hidden w-full relative py-2 mt-2">
                <div className="marquee">
                  {/* First set of tags */}
                  <span className="bg-white/95 border border-[#EFECE6]/80 text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    💼 Atacado
                  </span>
                  <span className="bg-white/95 border border-[#EFECE6]/80 text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    💰 Revenda
                  </span>
                  <span className="bg-white/95 border border-[#EFECE6]/80 text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    🏢 Empresa
                  </span>
                  <span className="bg-white/95 border border-[#EFECE6]/80 text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    🎉 Evento
                  </span>
                  <span className="bg-white/95 border border-[#EFECE6]/80 text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    🎁 Brindes
                  </span>
                  
                  {/* Duplicate set for endless looping seamless transition */}
                  <span className="bg-white/95 border border-[#EFECE6]/80 text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    💼 Atacado
                  </span>
                  <span className="bg-white/95 border border-[#EFECE6]/80 text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    💰 Revenda
                  </span>
                  <span className="bg-white/95 border border-[#EFECE6]/80 text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    🏢 Empresa
                  </span>
                  <span className="bg-white/95 border border-[#EFECE6]/80 text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    🎉 Evento
                  </span>
                  <span className="bg-white/95 border border-[#EFECE6]/80 text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    🎁 Brindes
                  </span>
                </div>
                {/* Visual fade-outs on left and right for beautiful design polish */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#F6F5F2] to-transparent pointer-events-none z-10"></div>
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#F6F5F2] to-transparent pointer-events-none z-10"></div>
              </div>

              {/* DESKTOP BADGES: STATIC CENTERED GRID */}
              <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
                <span className="bg-white/95 border border-[#EFECE6] text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] sm:text-xs px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                  💼 Atacado
                </span>
                <span className="bg-white/95 border border-[#EFECE6] text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] sm:text-xs px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                  💰 Revenda
                </span>
                <span className="bg-white/95 border border-[#EFECE6] text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] sm:text-xs px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                  🏢 Empresa
                </span>
                <span className="bg-white/95 border border-[#EFECE6] text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] sm:text-xs px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                  🎉 Evento
                </span>
                <span className="bg-white/95 border border-[#EFECE6] text-[#B8863B] font-extrabold uppercase tracking-wider text-[10px] sm:text-xs px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                  🎁 Brindes
                </span>
              </div>
            </div>

            {/* Caneca Atacado Acima na Horizontal (sem inversão) */}
            <div className="grid grid-cols-1 animate-fadeIn">
              <div 
                id="banner-propaganda-atacado-horizontal"
                className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-stone-950 aspect-[1.8/1] sm:aspect-[2.2/1] group cursor-pointer w-full"
                onClick={() => setSelectedAvailableMugIndex(9)}
                role="button"
                aria-label="Ver Detalhes Atacado"
              >
                <img
                  src="https://i.postimg.cc/mDks10Jh/canecas-personalizadas-no-atacado.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                />
                <img
                  src="https://i.postimg.cc/mDks10Jh/canecas-personalizadas-no-atacado.webp"
                  alt="Canecas Corporativas para Eventos e Empresas Atacado"
                  className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                  <span className="bg-[#B8863B] text-white text-[9.5px] min-[360px]:text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                    Ver Detalhes 🔍
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">

              {/* Caneca Preta */}
              <div 
                id="banner-adicional-preta-atacado"
                className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#EBE7E0] aspect-[1.8/1] group cursor-pointer"
                onClick={() => setSelectedAvailableMugIndex(1)}
                role="button"
                aria-label="Ver Detalhes Caneca Preta"
              >
                {/* 1. Efeito de fundo desfocado (blur) */}
                <img
                  src="https://i.postimg.cc/N0BLWzHW/caneca-preta-personalizada.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                />
                {/* 2. Imagem Principal */}
                <img
                  src="https://i.postimg.cc/N0BLWzHW/caneca-preta-personalizada.webp"
                  alt="Caneca Preta Personalizada"
                  className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                {/* Overlay Click Lightbox */}
                <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                  <span className="bg-[#B8863B] text-white text-[9.5px] min-[360px]:text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                    Ver Detalhes 🔍
                  </span>
                </div>
              </div>

              {/* Caneca Branca */}
              <div 
                id="banner-adicional-branca"
                className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#EBE7E0] aspect-[1.8/1] group cursor-pointer"
                onClick={() => setSelectedAvailableMugIndex(0)}
                role="button"
                aria-label="Ver Detalhes Caneca Branca"
              >
                <img
                  src="https://i.postimg.cc/1Xf8vVqG/caneca-branca-personalizada.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                />
                <img
                  src="https://i.postimg.cc/1Xf8vVqG/caneca-branca-personalizada.webp"
                  alt="Caneca Branca Personalizada"
                  className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                  <span className="bg-[#B8863B] text-white text-[9.5px] min-[360px]:text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                    Ver Detalhes 🔍
                  </span>
                </div>
              </div>

            </div>

            {/* Xícara Personalizada Abaixo na Horizontal (sem inversão) */}
            <div className="grid grid-cols-1 animate-fadeIn">
              <div 
                id="banner-propaganda-xicara-horizontal"
                className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#EBE7E0] aspect-[1.8/1] sm:aspect-[2.2/1] group cursor-pointer w-full"
                onClick={() => setSelectedAvailableMugIndex(10)}
                role="button"
                aria-label="Ver Detalhes Xícara Gourmet"
              >
                <img
                  src="https://i.postimg.cc/Hnpqmb2t/xicara-personalizada.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                />
                <img
                  src="https://i.postimg.cc/Hnpqmb2t/xicara-personalizada.webp"
                  alt="Xícaras Personalizadas de Porcelana"
                  className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                  <span className="bg-[#B8863B] text-white text-[9.5px] min-[360px]:text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                    Ver Detalhes 🔍
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. SESSÃO DESTAQUES EM CARROSSEL DE UMA LINHA COM INDICADOR INTEGRADO */}
      <section id="destaques" className="py-12 bg-[#F6F5F2] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2B2B2B] mt-1 relative inline-block">
              Destaques
              <div className="w-16 h-1 bg-[#B8863B] mx-auto mt-2 rounded" />
            </h2>
          </div>

          {/* Destaques Carousel Track */}
          <div className="relative max-w-5xl mx-auto px-4 sm:px-12 group/destaque-carousel">
            
            {/* Left navigation arrow */}
            <button
              onClick={() => scrollDestaques('left')}
              className="absolute -left-2 sm:left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/95 border border-[#EFECE6] text-[#B8863B] shadow-md hover:bg-stone-50 active:scale-95 transition-all duration-300 focus:outline-none cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Carousel track scrolling on 1 line. 2 items on mobile, 4 items on desktop */}
            <div
              ref={destaquesScrollRef}
              onScroll={handleDestaquesScroll}
              className="overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth flex gap-3 sm:gap-4 lg:gap-6 py-2 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {destaqueItems.map((item, idx) => {
                const itemPrice = getProductPrice(item.title);
                const formattedPrice = itemPrice.toFixed(2).replace('.', ',');
                const installments = `${(itemPrice / 12 * 1.15).toFixed(2).replace('.', ',')}`;
                const pixHighlight = `${(itemPrice * 0.95).toFixed(2).replace('.', ',')}`;

                return (
                  <div
                    key={`destaque-carousel-${item.title}-${idx}`}
                    className="w-[calc(50%-6px)] md:w-[calc(25%-18px)] flex-shrink-0 snap-start h-full"
                  >
                    <div
                      className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#EFECE6] hover:border-[#C8A66A] hover:shadow-lg transition-all duration-300 group cursor-pointer relative flex flex-col justify-between h-full"
                      onClick={() => {
                        if (item.type === 'gallery') {
                          setSelectedGalleryIndex(item.originalIndex);
                        } else {
                          setSelectedAvailableMugIndex(item.originalIndex);
                        }
                      }}
                    >
                      <div className="relative aspect-square overflow-hidden bg-stone-150 flex items-center justify-center flex-shrink-0 w-full">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Badge tag */}
                        <span className="absolute top-2 left-2 bg-[#B8863B]/95 backdrop-blur-xs text-white text-[7px] sm:text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-xs z-10">
                          {item.badge}
                        </span>

                        {/* Hover zoom trigger overlay */}
                        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white/95 text-stone-900 text-[9px] font-semibold px-2.5 py-1 rounded-full shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            Ver Detalhes 🔍
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 text-left flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-display font-extrabold text-[11px] sm:text-xs text-[#2B2B2B] leading-tight group-hover:text-[#B8863B] transition-colors line-clamp-1 h-3.5 sm:h-4 flex items-center" title={item.title}>
                            {item.title}
                          </h3>

                          {/* Espaço do preço e valor como loja real */}
                          <div className="mt-2 space-y-0.5 border-t border-stone-100 pt-2 pb-1 min-h-[56px] sm:min-h-[64px] flex flex-col justify-center">
                            <div className="font-sans font-extrabold text-xs sm:text-sm text-stone-900 leading-none">
                              R$ {formattedPrice}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-stone-500 leading-none">
                              12x de R$ {installments}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-[#25D366] font-extrabold leading-none">
                              R$ {pixHighlight} com Pix
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.type === 'gallery') {
                              setSelectedGalleryIndex(item.originalIndex);
                            } else {
                              setSelectedAvailableMugIndex(item.originalIndex);
                            }
                          }}
                          className="mt-2 w-full py-1.5 bg-[#627263] hover:bg-[#506051] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-md transition-all text-center flex items-center justify-center gap-1 cursor-pointer border-none shadow-xs h-7 sm:h-8"
                        >
                          <span>Comprar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right navigation arrow */}
            <button
              onClick={() => scrollDestaques('right')}
              className="absolute -right-2 sm:right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/95 border border-[#EFECE6] text-[#B8863B] shadow-md hover:bg-stone-50 active:scale-95 transition-all duration-300 focus:outline-none cursor-pointer"
              aria-label="Próxima"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

          </div>

          {/* Indicator of many photos and active index, as requested */}
          <div className="flex justify-center items-center mt-6 gap-3">
            <span className="px-3.5 py-1.5 bg-white text-[10px] sm:text-xs font-bold text-stone-600 border border-[#EFECE6] rounded-full shadow-xs tracking-wider select-none">
              Foto {currentDestaqueIndicatorIndex} de {destaqueItems.length}
            </span>
          </div>

        </div>
      </section>

      {/* SEÇÃO MODELOS ADICIONAIS: BANNERS DE 2 QUADROS EM GRELHA ABAIXO DOS DESTAQUES */}
      <section id="modelos-adicionais-grelha" className="py-12 bg-[#F6F5F2] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#2B2B2B] mt-1 relative inline-block uppercase tracking-tight">
              Canecas metalizadas
              <div className="w-16 h-1 bg-[#B8863B] mx-auto mt-2 rounded" />
            </h2>
          </div>

          {/* Versão DESKTOP (Sem efeito deslizante, estático e nítido) */}
          <div className="hidden md:block max-w-5xl mx-auto space-y-4 sm:space-y-6">
            {/* Fileira 1: Caneca Rosa Metalizada e Caneca Dourada */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div 
                id="banner-adicional-rosa-desktop"
                className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#EBE7E0] aspect-[1.8/1] group cursor-pointer"
                onClick={() => setSelectedAvailableMugIndex(3)}
                role="button"
                aria-label="Ver Detalhes Caneca Cromada Rosa"
              >
                <img
                  src="https://i.postimg.cc/PrK6pPWc/caneca-rosa-cromada-personalizada.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                />
                <img
                  src="https://i.postimg.cc/PrK6pPWc/caneca-rosa-cromada-personalizada.webp"
                  alt="Caneca Cromada Rosa"
                  className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                  <span className="bg-[#B8863B] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                    Ver Detalhes 🔍
                  </span>
                </div>
              </div>

              {/* Caneca Dourada */}
              <div 
                id="banner-adicional-dourada-desktop"
                className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#EBE7E0] aspect-[1.8/1] group cursor-pointer"
                onClick={() => setSelectedAvailableMugIndex(2)}
                role="button"
                aria-label="Ver Detalhes Caneca Dourada Metalizada"
              >
                <img
                  src="https://i.postimg.cc/qqs5ZwC1/caneca-dourada-metalizada-personalizada.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                />
                <img
                  src="https://i.postimg.cc/qqs5ZwC1/caneca-dourada-metalizada-personalizada.webp"
                  alt="Caneca Dourada Metalizada"
                  className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                  <span className="bg-[#B8863B] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                    Ver Detalhes 🔍
                  </span>
                </div>
              </div>
            </div>

            {/* Fileira 2: Caneca Cromada Prata */}
            <div className="grid grid-cols-1">
              <div 
                id="banner-adicional-prata-desktop"
                className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#EBE7E0] aspect-[2.2/1] group cursor-pointer w-full"
                onClick={() => setSelectedAvailableMugIndex(4)}
                role="button"
                aria-label="Ver Detalhes Caneca Cromada Prata"
              >
                <img
                  src="https://i.postimg.cc/kXZbpCqS/caneca-cromada-personalizada.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                />
                <img
                  src="https://i.postimg.cc/kXZbpCqS/caneca-cromada-personalizada.webp"
                  alt="Caneca Cromada Prata"
                  className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                  <span className="bg-[#B8863B] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                    Ver Detalhes 🔍
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Versão MOBILE (Com efeito de carrossel de circulação deslizante) */}
          <div className="md:hidden block">
            {(() => {
              const item1 = metallicItems[(0 + metallicOffset) % 3];
              const item2 = metallicItems[(1 + metallicOffset) % 3];
              const item3 = metallicItems[(2 + metallicOffset) % 3];

              return (
                <div className="max-w-5xl mx-auto space-y-4">
                  
                  {/* Fileira 1: Duas menores lado a lado */}
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      id="banner-adicional-rosa-mobile"
                      className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#EBE7E0] aspect-[1.8/1] group cursor-pointer"
                      onClick={() => setSelectedAvailableMugIndex(item1.index)}
                      role="button"
                      aria-label={item1.label}
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.div
                          key={item1.image}
                          initial={{ x: '100%', opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: '-100%', opacity: 0 }}
                          transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
                          className="absolute inset-0 w-full h-full"
                        >
                          <img
                            src={item1.image}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                          />
                          <img
                            src={item1.image}
                            alt={item1.title}
                            className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                            referrerPolicy="no-referrer"
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                        <span className="bg-[#B8863B] text-white text-[9.5px] min-[360px]:text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                          Ver Detalhes 🔍
                        </span>
                      </div>
                    </div>

                    {/* Caneca Dourada */}
                    <div 
                      id="banner-adicional-dourada-mobile"
                      className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#EBE7E0] aspect-[1.8/1] group cursor-pointer"
                      onClick={() => setSelectedAvailableMugIndex(item2.index)}
                      role="button"
                      aria-label={item2.label}
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.div
                          key={item2.image}
                          initial={{ x: '100%', opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: '-100%', opacity: 0 }}
                          transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
                          className="absolute inset-0 w-full h-full"
                        >
                          <img
                            src={item2.image}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                          />
                          <img
                            src={item2.image}
                            alt={item2.title}
                            className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                            referrerPolicy="no-referrer"
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                        <span className="bg-[#B8863B] text-white text-[9.5px] min-[360px]:text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                          Ver Detalhes 🔍
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fileira 3: Uma maior */}
                  <div className="grid grid-cols-1">
                    <div 
                      id="banner-adicional-prata-mobile"
                      className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#EBE7E0] aspect-[1.8/1] sm:aspect-[2.2/1] group cursor-pointer w-full"
                      onClick={() => setSelectedAvailableMugIndex(item3.index)}
                      role="button"
                      aria-label={item3.label}
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.div
                          key={item3.image}
                          initial={{ x: '-100%', opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: '100%', opacity: 0 }}
                          transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
                          className="absolute inset-0 w-full h-full"
                        >
                          <img
                            src={item3.image}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                          />
                          <img
                            src={item3.image}
                            alt={item3.title}
                            className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                            referrerPolicy="no-referrer"
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                        <span className="bg-[#B8863B] text-white text-[9.5px] min-[360px]:text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                          Ver Detalhes 🔍
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* 3. IMAGES DE DESTAQUE: BRANCA E PRETA EM CIMA, MÁGICA HORIZONTAL EMBAIXO */}
      <section id="banners-superiores-branca-preta" className="py-12 bg-[#F6F5F2] border-[#EFECE6]/80 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
            
            {/* Título de Chamada Customizado */}
            <div className="text-center py-2 px-1 max-w-3xl mx-auto">
              <style>{`
                @keyframes continuousPulse {
                  0%, 100% {
                    transform: scale(1);
                    text-shadow: 0 0 0px rgba(184, 134, 59, 0);
                  }
                  50% {
                    transform: scale(1.025);
                    text-shadow: 0 1px 10px rgba(184, 134, 59, 0.25);
                  }
                }
                .attention-pulse-interactive {
                  animation: continuousPulse 2.4s infinite ease-in-out;
                  display: inline-block;
                  will-change: transform;
                }
              `}</style>
              <div className="attention-pulse-interactive cursor-default">
                <p className="text-[#5C554E] font-bold text-[16px] min-[360px]:text-[18px] sm:text-[20px] md:text-[22px] leading-relaxed tracking-wide uppercase">
                  Milhares de artes personalizadas
                </p>
              </div>
            </div>

            {/* Caneca Branca e Preta Lado a Lado */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              
              {/* Caneca com Alça de Coração */}
              <div 
                id="card-propaganda-coracao" 
                className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#EBE7E0] aspect-[1.8/1] group cursor-pointer"
                onClick={() => setSelectedAvailableMugIndex(8)}
                role="button"
                aria-label="Ver Detalhes Caneca com Alça de Coração"
              >
                {/* 1. Efeito de fundo desfocado (blur) */}
                <img
                  src="https://i.postimg.cc/qq84p2WR/caneca-alca-de-coracao-personalizada.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                />
                {/* 2. Imagem Principal */}
                <img
                  src="https://i.postimg.cc/qq84p2WR/caneca-alca-de-coracao-personalizada.webp"
                  alt="Caneca com Alça de Coração"
                  className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                {/* Overlay Click Lightbox */}
                <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                  <span className="bg-[#B8863B] text-white text-[9.5px] min-[360px]:text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                    Ver Detalhes 🔍
                  </span>
                </div>
              </div>

              {/* Caneca Preta */}
              <div 
                id="banner-adicional-preta"
                className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#EBE7E0] aspect-[1.8/1] group cursor-pointer"
                onClick={() => setSelectedAvailableMugIndex(1)}
                role="button"
                aria-label="Ver Detalhes Caneca Preta"
              >
                <img
                  src="https://i.postimg.cc/N0BLWzHW/caneca-preta-personalizada.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                />
                <img
                  src="https://i.postimg.cc/N0BLWzHW/caneca-preta-personalizada.webp"
                  alt="Caneca Preta Personalizada"
                  className="relative w-full h-full object-cover z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                  <span className="bg-[#B8863B] text-white text-[9.5px] min-[360px]:text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                    Ver Detalhes 🔍
                  </span>
                </div>
              </div>

            </div>

            {/* Caneca Sagrada Horizontal Acima (sem inversão) */}
            <div className="grid grid-cols-1 animate-fadeIn pb-2 sm:pb-4">
              <div 
                id="banner-propaganda-sagrada-superior-horizontal"
                className="relative rounded-2xl overflow-hidden shadow-xl border border-[#FFF] bg-[#0c0c0c] aspect-[1.8/1] sm:aspect-[2.2/1] group cursor-pointer w-full"
                onClick={() => setSelectedAvailableMugIndex(11)}
                role="button"
                aria-label="Ver Detalhes Caneca Sagrada"
              >
                <img
                  src="https://i.postimg.cc/qRZLMtnt/caneca-sagrada-1080x600-banner-vitrine.jpg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                />
                <img
                  src="https://i.postimg.cc/qRZLMtnt/caneca-sagrada-1080x600-banner-vitrine.jpg"
                  alt="Caneca Sagrada Personalizada"
                  className="relative w-full h-full object-contain object-center z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                  <span className="bg-[#B8863B] text-white text-[9.5px] min-[360px]:text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                    Ver Detalhes 🔍
                  </span>
                </div>
              </div>
            </div>

            {/* Caneca Mágica Horizontal Abaixo (sem inversão) */}
            <div className="grid grid-cols-1 animate-fadeIn">
              <div 
                id="banner-propaganda-magica-horizontal"
                className="relative rounded-2xl overflow-hidden shadow-xl border border-white bg-[#0c0c0c] aspect-[1.8/1] sm:aspect-[2.2/1] group cursor-pointer w-full"
                onClick={() => setSelectedAvailableMugIndex(7)}
                role="button"
                aria-label="Ver Detalhes Caneca Mágica"
              >
                <img
                  src="https://i.postimg.cc/L6wMbgFx/caneca-magica-personalizada-banner-vitrine.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl brightness-[0.35] scale-125 select-none pointer-events-none"
                />
                <img
                  src="https://i.postimg.cc/L6wMbgFx/caneca-magica-personalizada-banner-vitrine.webp"
                  alt="Caneca Mágica Personalizada"
                  className="relative w-full h-full object-contain object-center z-10 scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 z-20 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center select-none gap-2">
                  <span className="bg-[#B8863B] text-white text-[9.5px] min-[360px]:text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 border border-white/10 whitespace-nowrap">
                    Ver Detalhes 🔍
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CATALOGO DELETADO DA POSIÇÃO ANTIGA CORRETAMENTE */}

      {/* 5. SESSÃO DATAS ESPECIAIS */}
      <section id="datas-especiais" className="py-16 bg-[#EFECE6] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="font-display font-medium text-2xl sm:text-3xl text-stone-900 tracking-tight">
              Datas Especiais
            </h2>
          </div>

          {/* Versão Desktop: Grid Normal */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SPECIAL_DATES.map((date) => (
              <div
                key={date.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-white/80 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl"
              >
                
                {/* Visual Banner card representation */}
                <div className="relative h-48 overflow-hidden select-none">
                  <img
                    src={date.bgImage}
                    alt={date.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/8 w-full h-full bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Card description body */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <h3 className="font-display font-bold text-xl sm:text-2xl text-[#2B2B2B]">
                        {date.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#B8863B]/10 text-[#B8863B] text-[10px] font-bold uppercase tracking-wider">
                        Coleção Vip
                      </span>
                    </div>
                    <p className="text-[#B8863B] text-sm font-semibold mt-1">
                      {date.description}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm mt-3 leading-relaxed">
                      {date.tagline}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleWhatsAppRedirect({ type: 'Especial', text: date.title, sub: date.description })}
                      className="w-full py-2.5 px-4 bg-transparent hover:bg-[#25D366] text-[#2B2B2B] hover:text-white font-semibold text-xs uppercase rounded-lg border border-[#EFECE6] hover:border-[#25D366] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Ver Modelos no WhatsApp</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Versão Mobile: Carrossel Interativo */}
          <div className="md:hidden">
            <div className="relative max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-md border border-white/80 flex flex-col justify-between group min-h-[460px]">
              
              {/* Visual Banner card representation */}
              <div className="relative h-44 overflow-hidden select-none">
                <img
                  src={SPECIAL_DATES[currentDateSlide].bgImage}
                  alt={SPECIAL_DATES[currentDateSlide].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                {/* Controles seta Anterior */}
                <button
                  type="button"
                  onClick={() => setCurrentDateSlide((prev) => (prev - 1 + SPECIAL_DATES.length) % SPECIAL_DATES.length)}
                  className="absolute left-3 bottom-3 z-20 w-7 h-7 rounded-full bg-white/95 border-2 border-[#C8A66A] active:bg-[#F6F5F2] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
                  aria-label="Slide anterior"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-[#B8863B]" />
                </button>

                {/* Controles seta Próximo */}
                <button
                  type="button"
                  onClick={() => setCurrentDateSlide((prev) => (prev + 1) % SPECIAL_DATES.length)}
                  className="absolute right-3 bottom-3 z-20 w-7 h-7 rounded-full bg-white/95 border-2 border-[#C8A66A] active:bg-[#F6F5F2] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
                  aria-label="Próximo slide"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-[#B8863B]" />
                </button>
              </div>

              {/* Card description body */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <h3 className="font-display font-bold text-lg text-[#2B2B2B]">
                      {SPECIAL_DATES[currentDateSlide].title}
                    </h3>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#B8863B]/10 text-[#B8863B] text-[9px] font-bold uppercase tracking-wider">
                      Coleção Vip
                    </span>
                  </div>
                  <p className="text-[#B8863B] text-xs font-semibold mt-0.5 font-sans">
                    {SPECIAL_DATES[currentDateSlide].description}
                  </p>
                  <p className="text-gray-600 text-xs mt-3.5 leading-relaxed font-sans">
                    {SPECIAL_DATES[currentDateSlide].tagline}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleWhatsAppRedirect({ type: 'Especial', text: SPECIAL_DATES[currentDateSlide].title, sub: SPECIAL_DATES[currentDateSlide].description })}
                    className="w-full py-2.5 px-4 bg-transparent hover:bg-[#25D366] text-[#2B2B2B] hover:text-white font-semibold text-xs uppercase rounded-lg border border-[#EFECE6] hover:border-[#25D366] transition-all flex items-center justify-center space-x-2 cursor-pointer font-sans"
                  >
                    <span>Ver Modelos no WhatsApp</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Pontos de navegação (Dots) */}
            <div className="flex justify-center space-x-2 mt-4">
              {SPECIAL_DATES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentDateSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentDateSlide === idx ? 'bg-[#C8A66A] w-4' : 'bg-gray-300'
                  }`}
                  aria-label={`Ir para slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>



      {/* 7. SESSÃO CTA NO MEIO DA PÁGINA */}
      <section className="py-23 bg-neutral-950 text-white relative overflow-hidden">
        
        {/* Imagem de Fundo de Destaque para o CTA */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <img
            src="https://i.postimg.cc/0y8Gcckb/arte-caneca-dia-dos-pais-earty-digital-9.png"
            alt="Fundo de Canecas Personalizadas de Luxo"
            className="w-full h-full object-cover opacity-75 filter brightness-95 contrast-105"
            referrerPolicy="no-referrer"
          />
          {/* Degradê sutil para fundir as extremidades mantendo a imagem totalmente visível */}
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/10 to-neutral-950/85" />
        </div>

        {/* Glowing backdrop elements mimicking hot porcelain gilding process */}
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#B8863B]/15 rounded-full blur-3xl pointer-events-none z-0"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C8A66A]/15 rounded-full blur-3xl pointer-events-none z-0"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
          <span className="text-[#C8A66A] font-bold tracking-widest text-xs uppercase block mb-3 drop-shadow-md">
            Peça Sob Medida
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-none mb-6 drop-shadow-lg">
            Crie agora sua caneca personalizada
          </h2>
          <p className="text-md sm:text-lg text-white font-medium max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
            Envie sua ideia, foto, frase ou identidade de empresa e transformamos em uma peça exclusiva feita especialmente para você, com acompanhamento de design dedicado no chat.
          </p>

          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button
              onClick={() => handleWhatsAppRedirect()}
              className="w-full sm:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg rounded-full shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Falar no WhatsApp Agora</span>
              <span>💬</span>
            </button>
            <a
              href="#catalogo"
              className="w-full sm:w-auto px-6 py-4 bg-transparent border border-white/20 text-white/80 hover:bg-white/5 text-sm font-semibold rounded-full tracking-wider transition-all"
            >
              Ver Catálogo Completo
            </a>
          </div>

          <p className="text-xs text-white/50 mt-6 font-mono select-none">
            🎨 Ajustamos sua arte gratuitamente antes de produzir!
          </p>
        </div>
      </section>

      {/* 8. SESSÃO DE DEPOIMENTOS */}
      <section id="depoimentos" className="py-16 bg-[#EFECE6] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="font-display font-medium text-2xl sm:text-3xl text-stone-900 tracking-tight">
              Quem Compra Recomenda
            </h2>
          </div>

          {/* Testimonial Carousel display with interactive controls */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 sm:p-10 border border-white/80 relative">
            
            {/* Stars rendering */}
            <div className="flex justify-center space-x-1 text-amber-400 mb-6 font-mono">
              {[...Array(USER_REVIEWS[currentReview].rating)].map((_, i) => (
                <Star key={i} className="w-5.5 h-5.5 fill-[#C8A66A] text-[#C8A66A]" />
              ))}
            </div>

            {/* Quote comment */}
            <blockquote className="text-center text-[#2B2B2B] text-lg sm:text-xl font-medium leading-relaxed italic mb-8 select-none">
              “{USER_REVIEWS[currentReview].comment}”
            </blockquote>

            {/* Author info */}
            <div className="text-center">
              <h4 className="font-display font-bold text-md text-[#2B2B2B]">
                {USER_REVIEWS[currentReview].name}
              </h4>
              <p className="text-xs text-[#B8863B] font-medium uppercase mt-0.5 tracking-wider">
                {USER_REVIEWS[currentReview].location}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {USER_REVIEWS[currentReview].date}
              </p>
            </div>

            {/* Previous and Next Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:-left-6">
              <button
                onClick={() => setCurrentReview((prev) => (prev - 1 + USER_REVIEWS.length) % USER_REVIEWS.length)}
                className="w-10 h-10 rounded-full bg-white border border-[#EFECE6] hover:border-[#C8A66A] shadow-md flex items-center justify-center text-gray-600 hover:text-[#B8863B] transition-all cursor-pointer"
                aria-label="Depoimento anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:-right-6">
              <button
                onClick={() => setCurrentReview((prev) => (prev + 1) % USER_REVIEWS.length)}
                className="w-10 h-10 rounded-full bg-white border border-[#EFECE6] hover:border-[#C8A66A] shadow-md flex items-center justify-center text-gray-600 hover:text-[#B8863B] transition-all cursor-pointer"
                aria-label="Próximo depoimento"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Slide indicators dot list */}
            <div className="flex justify-center space-x-2 mt-8">
              {USER_REVIEWS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentReview(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentReview === idx ? 'bg-[#C8A66A] w-5' : 'bg-gray-200'
                  }`}
                  aria-label={`Visualizar depoimento ${idx + 1}`}
                />
              ))}
            </div>

          </div>

          {/* Elegant satisfaction badges logos beneath */}
          <div className="mt-14 flex flex-wrap justify-center items-center gap-8 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5"><Check className="text-emerald-500 w-4 h-4"/> 100% de Clientes Satisfeitos</span>
            <span className="flex items-center gap-1.5"><Check className="text-emerald-500 w-4 h-4"/> Embalagens de Alta Proteção</span>
            <span className="flex items-center gap-1.5"><Check className="text-emerald-500 w-4 h-4"/> Envio com Nota Fiscal</span>
          </div>

        </div>
      </section>

        </div>
      )}



      {/* 9. RODAPÉ & CONTATO */}
      <footer id="contato" className="bg-[#2B2B2B] text-white/90 pt-16 pb-12 scroll-mt-20 border-t border-[#C8A66A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
            
            {/* Widget Brand */}
            <div className="md:col-span-5 flex flex-col justify-start">
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="w-9 h-9 rounded-full border border-[#C8A66A]/60 bg-white flex items-center justify-center">
                  <span className="text-[#B8863B] font-extrabold text-[15px]">Q</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-extrabold text-white text-md uppercase leading-none tracking-tight">Quality</span>
                  <span className="text-[9px] tracking-widest text-[#C8A66A] font-bold uppercase">Canecas Personalizadas</span>
                </div>
              </div>

              {/* Seção Sobre Nós */}
              <div className="mb-6">
                <h5 className="font-display font-bold text-white text-[11px] uppercase tracking-widest mb-2 border-l-2 border-[#C8A66A] pl-2">
                  Sobre Nós
                </h5>
                <p className="text-[11px] sm:text-xs text-white/75 max-w-sm leading-relaxed text-justify">
                  Somos uma empresa dedicada a oferecer uma ampla variedade de canecas personalizadas altamente sofisticadas, criadas para marcar momentos e todas as ocasiões especiais. Nossas peças são confeccionadas em cerâmica de altíssima qualidade, garantindo um brilho excepcional, cores vibrantes e excelente durabilidade. Entre os nossos destaques estão as famosas Canecas Mágicas (que revelam designs incríveis com o calor), canecas interativas Spotify, canecas cromadas e metais nobres, além de opções personalizadas sob medida com fotos ou logotipos corporativos, ideais tanto para presentear com amor quanto para destacar sua empresa.
                </p>
              </div>

              {/* Secure certifications badges inside footer */}
              <div className="flex items-center space-x-4 mb-4 select-none">
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">
                  <span className="text-emerald-500 text-[10px] leading-none">✔</span>
                  <span className="text-[9px] text-white/80 font-semibold tracking-wider uppercase">SSL Protegido</span>
                </div>
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">
                  <span className="text-amber-500 text-[10px] leading-none">★</span>
                  <span className="text-[9px] text-white/80 font-semibold tracking-wider uppercase">Compra Garantida</span>
                </div>
              </div>
            </div>

            {/* Widget links */}
            <div className="md:col-span-3">
              <h4 className="font-display font-medium text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-[#C8A66A] pl-2.5">
                Navegação Rápida
              </h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#inicio" className="text-white/60 hover:text-[#C8A66A] transition-colors">Voltar ao Topo</a></li>
                <li><a href="#simulador" className="text-white/60 hover:text-[#C8A66A] transition-colors">Simulador Virtual</a></li>
                <li><a href="#catalogo" className="text-white/60 hover:text-[#C8A66A] transition-colors">Catálogo Completo</a></li>
                <li><a href="#datas-especiais" className="text-white/60 hover:text-[#C8A66A] transition-colors">Datas Especiais</a></li>
              </ul>
            </div>

            {/* Widget contacts */}
            <div className="md:col-span-4">
              <h4 className="font-display font-medium text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-[#C8A66A] pl-2.5">
                Central de Atendimento
              </h4>
              <p className="text-xs text-white/70 mb-4 leading-normal">
                Clique nos contatos abaixo para iniciar o atendimento imediato pelo WhatsApp ou nos seguir no Instagram:
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleWhatsAppRedirect()}
                  className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-[#25D366] hover:text-[#25D366] flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">WhatsApp: <strong className="text-white font-normal">(31) 99361-1007</strong></span>
                  <span>💬</span>
                </button>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold inline-flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2 text-white/80">Siga no Instagram: <strong className="text-white font-normal">@qualitycanecas</strong></span>
                  <Instagram className="w-4 h-4 text-pink-400" />
                </a>
              </div>

            </div>

          </div>

          {/* Footer bottom bar details */}
          <div className="pt-8 mt-8 border-t border-white/10 text-center flex flex-col sm:flex-row items-center sm:justify-between gap-4">
            
            {/* Accepted Payments display */}
            <div className="flex flex-col items-center sm:items-start gap-1">
              <span className="text-[10px] text-white/50 uppercase tracking-widest leading-none block">Formas de Pagamento</span>
              <div className="flex items-center space-x-2 text-[10px] text-white/70 font-mono mt-1">
                <span className="px-1.5 py-0.5 bg-white/10 rounded tracking-wider font-bold">PIX</span>
                <span className="px-1.5 py-0.5 bg-white/10 rounded">Cartão de Crédito</span>
                <span className="px-1.5 py-0.5 bg-white/10 rounded">Boleto</span>
              </div>
            </div>

            <p className="text-[11px] text-white/50 leading-relaxed max-w-sm sm:text-right select-none">
              © Quality Canecas Personalizadas — Todos os direitos reservados. CNPJ: 00.000.000/0001-00. Avenida Europa, São Paulo - SP.
            </p>

          </div>

        </div>
      </footer>

      {/* ✅ EXTRAS OBRIGATÓRIOS: BOTÃO FLUTUANTE DE WHATSAPP FIXO NO CANTO INFERIOR DIREITO */}
      <button
        id="btn-whatsapp-flutuante-fixo"
        onClick={() => handleWhatsAppRedirect()}
        className="fixed bottom-6 right-3 sm:right-6 z-50 p-2 sm:p-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 duration-300 flex items-center justify-center group cursor-pointer"
        aria-label="Fale conosco no WhatsApp"
      >
        <span className="absolute right-11 bg-[#2B2B2B] text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 shadow-md whitespace-nowrap">
          Fale Conosco ✓
        </span>
        
        {/* Animated pulse halo ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping -z-10"></span>
        
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.193 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.743.002-2.602-1.012-5.05-2.856-6.897C16.639 2.118 14.195 1.1 11.6 1.1c-5.439 0-9.864 4.374-9.868 9.748-.002 1.93.51 3.813 1.485 5.454L2.242 21.75l5.405-1.416zM17.47 14.39c-.32-.16-1.89-.93-2.185-1.04-.294-.11-.51-.16-.724.16-.215.32-.83.104-1.02.16-.19.055-.38.16-.7 0-.32-.16-1.35-.5-2.58-1.59-.955-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.22.05-.41-.03-.57-.08-.16-.72-1.74-.99-2.39-.26-.63-.53-.55-.725-.56-.19-.01-.4-.01-.6-.01-.2 0-.53.07-.8.37-.28.3-1.07 1.05-1.07 2.56s1.09 2.97 1.24 3.17c.15.2 2.15 3.28 5.21 4.6 1.23.53 1.87.69 2.51.76.71.07 1.35.03 1.86-.05.57-.08 1.89-.77 2.16-1.52.27-.75.27-1.4.19-1.53-.08-.13-.3-.21-.62-.37z"/>
        </svg>
      </button>

      {/* 📸 NOVO RECURSO: MASTER PÁGINA DE DETALHES E DESCRIÇÃO PREMIUM (INTERATIVA & SCROLLABLE) */}
      <AnimatePresence>
        {(selectedGalleryIndex !== null || selectedAvailableMugIndex !== null) && (() => {
          const isGallery = selectedGalleryIndex !== null;
          const activeIndex = isGallery ? selectedGalleryIndex : selectedAvailableMugIndex;
          const activeItem = isGallery ? galleryItems[selectedGalleryIndex!] : availableMugs[selectedAvailableMugIndex!];
          
          if (!activeItem) return null;

          // Generate 4 mock viewpoints for this product to feel super real
          const mockImages = [
            activeItem.image,
            "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80", // Packaging box mockup
            "https://images.unsplash.com/photo-1517256064527-09c53b2d0ec6?auto=format&fit=crop&w=600&q=80", // Cozy table desk workspace mockup
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"  // Close-up ceramic details
          ];

          // Related items showing other products
          const relatedItems = isGallery 
            ? availableMugs.slice(0, 4).map((m, idx) => ({ ...m, originalIndex: idx, type: 'available' }))
            : galleryItems.slice(0, 4).map((g, idx) => ({ ...g, originalIndex: idx, type: 'gallery' }));

          const finalPayLink = getMugPayLink(activeItem.title, (activeItem as any).infinitePayLink);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0c0a09]/95 backdrop-blur-md z-[100] overflow-y-auto block p-2 sm:p-4 md:p-8"
              onClick={() => {
                setSelectedGalleryIndex(null);
                setSelectedAvailableMugIndex(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative max-w-5xl w-full bg-[#fdfdfc] rounded-3xl border border-[#C8A66A]/20 overflow-hidden shadow-2xl mx-auto my-2 sm:my-6 text-stone-900"
                onClick={(e) => e.stopPropagation()}
                id="quality-product-details-page"
              >
                {/* Float Close Button */}
                <button
                  onClick={() => {
                    setSelectedGalleryIndex(null);
                    setSelectedAvailableMugIndex(null);
                  }}
                  className="absolute top-4 right-4 z-50 p-2 sm:p-2.5 rounded-full bg-stone-900/10 hover:bg-stone-900/20 text-stone-700 hover:text-stone-950 transition-all border border-stone-200 cursor-pointer shadow-sm flex items-center justify-center bg-white/80"
                  aria-label="Fechar detalhes"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Sub-Header bar for security trust */}
                <div className="w-full bg-stone-100/80 px-4 sm:px-6 py-2.5 border-b border-stone-200/90 text-[10px] sm:text-xs text-stone-500 font-medium tracking-wide flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <span className="text-[#C8A66A]">⭐</span>
                    <span className="text-stone-850 font-extrabold uppercase">Quality Premium Mugs</span> — Compra 100% Segura e Garantida
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                    <span className="text-[10px] text-stone-600 font-bold uppercase font-sans">98 pedidos nas últimas 24h</span>
                  </div>
                </div>

                {/* Content body split */}
                <div className="p-4 sm:p-6 md:p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
                    
                    {/* COL 1: FOTOS DO PRODUTO (GALERIA INTERATIVA) */}
                    <div className="md:col-span-6 space-y-4">
                      {/* Imagem Principal */}
                      <div className="aspect-square bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 flex items-center justify-center relative overflow-hidden group/product">
                        {/* Interactive Zoom Overlay */}
                        <div className="absolute top-3 left-3 bg-[#C8A66A] text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm z-10">
                          {activeItem.badge || 'PRODUTO EXCLUSIVO'}
                        </div>
                        
                        <img
                          src={mockImages[activePhotoIdx]}
                          alt={activeItem.title}
                          className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover/product:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Miniaturas de Fotos do Produto */}
                      <div className="grid grid-cols-4 gap-3">
                        {mockImages.map((img, idx) => (
                          <button
                            key={`thumb-${idx}`}
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`aspect-square rounded-xl overflow-hidden border-2 bg-white transition-all p-1 shadow-xs hover:scale-105 cursor-pointer ${
                              activePhotoIdx === idx 
                                ? 'border-[#C8A66A] ring-2 ring-[#C8A66A]/20' 
                                : 'border-stone-200 hover:border-stone-400'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        ))}
                      </div>

                      {/* Selos de Qualidade */}
                      <div className="bg-stone-50 border border-stone-150 rounded-xl p-4 grid grid-cols-3 gap-2 text-center">
                        <div className="space-y-1">
                          <span className="text-lg block">☕</span>
                          <span className="text-[10px] font-black text-stone-700 leading-tight uppercase block">Lava-Louças</span>
                          <span className="text-[9px] text-stone-500 block leading-tight">Totalmente Seguro</span>
                        </div>
                        <div className="space-y-1 border-x border-stone-200">
                          <span className="text-lg block">🔥</span>
                          <span className="text-[10px] font-black text-stone-700 leading-tight uppercase block">Micro-Ondas</span>
                          <span className="text-[9px] text-stone-500 block leading-tight">Super Resistente</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-lg block">✨</span>
                          <span className="text-[10px] font-black text-stone-700 leading-tight uppercase block">Tinta AAA+</span>
                          <span className="text-[9px] text-stone-500 block leading-tight">Resolução Máxima</span>
                        </div>
                      </div>
                    </div>

                    {/* COL 2: PAINEL DE SESSÕES & COMPRA */}
                    <div className="md:col-span-6 space-y-5 text-left">
                      <div className="space-y-2">
                        {/* Avaliações em Estrelas */}
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold font-sans">
                          <div className="flex select-none">⭐⭐⭐⭐⭐</div>
                          <span className="text-stone-550 font-semibold">(142 avaliações dos clientes)</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-stone-900 tracking-tight leading-tight">
                          {activeItem.title}
                        </h2>

                        <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                          {activeItem.tagline}
                        </p>
                      </div>

                      {/* Display de Preços Profissional */}
                      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-1 bg-gradient-to-r from-stone-50/50 to-white">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-stone-400 text-xs line-through font-medium">De R$ {getProductPrice(activeItem.title) === 5.00 ? '19,90' : '69,90'}</span>
                          <span className="text-[#C8A66A] text-2xl font-black font-mono">
                            R$ {(getProductPrice(activeItem.title) * productQty).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#25D366] font-bold uppercase tracking-wider flex items-center gap-1">
                          <span>🔥</span> FRETE GRÁTIS NA COMPRA DE 2 OU MAIS UNIDADES
                        </p>
                        <p className="text-xs text-stone-500">
                          Ou até <strong className="text-stone-700 font-mono">3x de R$ {((getProductPrice(activeItem.title) * productQty) / 3).toFixed(2).replace('.', ',')}</strong> sem juros no cartão
                        </p>
                      </div>

                      {/* ÁREA DE PERSONALIZAÇÃO INTERATIVA (MUITO PEDIDA PELO CLIENTE) */}
                      <div className="bg-[#FAF8F5] border-2 border-dashed border-[#C8A66A]/30 rounded-2xl p-4 sm:p-5 space-y-4">
                        <div className="flex items-center justify-between pb-1.5 border-b border-[#C8A66A]/10">
                          <h4 className="text-xs font-black text-[#A68042] uppercase tracking-wider flex items-center gap-1.5">
                            <span>✨</span> Personalização Própria (Opcional)
                          </h4>
                          <span className="text-[9px] bg-[#EBE4D5] text-[#7A5B2C] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded">
                            Grátis
                          </span>
                        </div>

                        {/* File Artwork Upload Area */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-stone-700 uppercase tracking-wide block">
                            1. Enviar Foto ou Logotipo da sua Estampa:
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 border-2 border-dashed border-stone-300 hover:border-[#C8A66A]/50 bg-white hover:bg-stone-50/50 rounded-xl p-3.5 transition-all text-center cursor-pointer relative overflow-hidden group">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setCustomPhotoName(file.name);
                                    const reader = new FileReader();
                                    reader.onload = (loadEvt) => {
                                      setCustomPhoto(loadEvt.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <div className="space-y-1.5">
                                <span className="text-xl block group-hover:scale-110 transition-transform">📸</span>
                                <p className="text-[10px] text-stone-600 font-bold uppercase tracking-wide">
                                  {customPhotoName ? 'Alterar Foto Selecionada' : 'Escolher Arquivo no Celular/PC'}
                                </p>
                                <p className="text-[9px] text-stone-400">
                                  PNG, JPG ou WEBP de alta qualidade
                                </p>
                              </div>
                            </label>

                            {/* Image Preview Thumbnail if loaded */}
                            {customPhoto && (
                              <div className="relative w-16 h-16 rounded-xl border border-stone-200 overflow-hidden bg-white shrink-0 p-1 group/thumb">
                                <img
                                  src={customPhoto}
                                  alt="Preview arte"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => {
                                    setCustomPhoto(null);
                                    setCustomPhotoName('');
                                  }}
                                  className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all font-black text-xs cursor-pointer rounded-lg"
                                  title="Remover foto"
                                >
                                  Remover
                                </button>
                              </div>
                            )}
                          </div>
                          {customPhotoName && (
                            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <span>✅</span> Arquivo anexado: <strong>{customPhotoName}</strong>
                            </p>
                          )}
                        </div>

                        {/* Custom Text Option Field */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-stone-700 uppercase tracking-wide block">
                            2. Frase, Nome ou Texto para Estampar (Opcional):
                          </label>
                          <textarea
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="Ex: Escrever 'Família é Amor' no lado de trás com letra cursiva sofisticada..."
                            className="w-full min-h-[60px] p-2.5 text-xs text-stone-800 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C8A66A]/30 focus:border-[#C8A66A] transition-all resize-none font-sans placeholder-stone-400"
                          />
                        </div>
                      </div>

                      {/* SELETOR DE QUANTIDADE PREMIUM */}
                      <div className="flex items-center gap-4">
                        <label className="text-[11px] font-black text-stone-700 uppercase tracking-wide">
                          Quantidade:
                        </label>
                        <div className="flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs h-10 w-28 shrink-0">
                          <button
                            onClick={() => setProductQty((prev) => Math.max(1, prev - 1))}
                            className="w-9 h-full hover:bg-stone-100 text-stone-700 active:bg-stone-200 font-black text-sm flex items-center justify-center transition-all cursor-pointer border-r border-stone-200"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center font-bold font-mono text-xs text-stone-800">
                            {productQty}
                          </span>
                          <button
                            onClick={() => setProductQty((prev) => prev + 1)}
                            className="w-9 h-full hover:bg-stone-100 text-stone-700 active:bg-stone-200 font-black text-sm flex items-center justify-center transition-all cursor-pointer border-l border-stone-200"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* BOTÕES PRINCIPAIS DE CALL TO ACTION */}
                      <div className="flex flex-col gap-2.5 pt-2">
                        {/* BOTÃO COMPRAR AGORA (MÉTODOS UNIFICADOS) */}
                        <button
                          onClick={() => {
                            // Configurar o checkout transparente seguro integrado
                            setActiveCheckoutLink(finalPayLink || 'https://sandbox.checkout.qualitymugs.com');
                            setActiveCheckoutName(activeItem.title);
                            setActiveCheckoutImage(activeItem.image);
                            setActiveCheckoutIframeLoading(true);
                            setCustPaymentMethod('pix_pushin'); // Auto-charge pre-arranged 
                            setCheckoutStep(1); // Reset to identification stage

                            // Close Details Overlay
                            setSelectedGalleryIndex(null);
                            setSelectedAvailableMugIndex(null);
                          }}
                          className="w-full py-4 px-6 bg-gradient-to-r from-[#C8A66A] to-[#B8863B] hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
                        >
                          <span>FECHAR PEDIDO DESTA 💳</span>
                        </button>

                        <div className="flex gap-2 w-full">
                          {/* BOTÃO ADICIONAR E CONTINUAR ESCOLHENDO (FLUXO 3 PÁGINAS SOLICITADO PELO CLIENTE) */}
                          <button
                            onClick={() => {
                              // Adiciona ao carrinho / escolhas acumuladas
                              setCartItems(prev => {
                                const existingIdx = prev.findIndex(i => i.title === activeItem.title);
                                let updated;
                                if (existingIdx > -1) {
                                  updated = [...prev];
                                  updated[existingIdx] = {
                                    ...updated[existingIdx],
                                    qty: updated[existingIdx].qty + productQty,
                                    customText: customText || updated[existingIdx].customText,
                                    customPhoto: customPhoto || updated[existingIdx].customPhoto,
                                    customPhotoName: customPhotoName || updated[existingIdx].customPhotoName
                                  };
                                } else {
                                  updated = [...prev, {
                                    title: activeItem.title,
                                    image: activeItem.image,
                                    price: getProductPrice(activeItem.title),
                                    qty: productQty,
                                    customText: customText,
                                    customPhoto: customPhoto,
                                    customPhotoName: customPhotoName
                                  }];
                                }
                                return updated;
                              });

                              setToastMessage(`🎉 "${activeItem.title}" adicionada! Você pode continuar escolhendo ou faturar agora.`);
                              setTimeout(() => setToastMessage(null), 4500);

                              // Close Details Overlay para voltar ao catálogo / menu diretamente!
                              setSelectedGalleryIndex(null);
                              setSelectedAvailableMugIndex(null);
                            }}
                            className="flex-1 py-3.5 px-3 bg-slate-100 hover:bg-slate-200 text-stone-700 hover:text-stone-900 border border-slate-300 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider rounded-xl hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans shadow-sm"
                          >
                            <span>🛒 ADICIONAR E CONTINUAR</span>
                          </button>

                          {/* BOTÃO CONSULTAR WHATSAPP */}
                          <button
                            onClick={() => {
                              const personalMsg = `${customPhotoName ? `\n📸 Anexo: *[${customPhotoName}]*` : ''}${customText ? `\n✏️ Detalhe Arte: *"${customText}"*` : ''}`;
                              const msgText = `Olá, tudo bem? Gostaria de idealizar um modelo Virtual da caneca *${activeItem.title}* (Quantidade: *${productQty}x*).\n\n*Minhas Escolhas:*${personalMsg}\n\nConsegue enviar um layout da arte no 3D pra mim no WhatsApp?`;
                              
                              handleWhatsAppRedirect({
                                type: 'Showroom',
                                text: activeItem.title,
                                sub: msgText
                              });
                              
                              setSelectedGalleryIndex(null);
                              setSelectedAvailableMugIndex(null);
                            }}
                            className="flex-1 py-3.5 px-3 bg-[#25D366] hover:bg-[#128C7E] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans"
                          >
                            <span className="text-xs">💬</span>
                            <span>DESIGNER</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* SEÇÃO DOWNSTREAM: DETALHES TÉCNICOS & DESCRIÇÃO DETALHADA */}
                  <div className="border-t border-stone-200 pt-8 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      {/* Left: Beautiful detailed text info */}
                      <div className="md:col-span-8 space-y-5 text-left">
                        <h3 className="text-lg font-black uppercase text-stone-900 tracking-wide flex items-center gap-1.5 mb-1 text-left">
                          <span>📋</span> Descrição & Detalhes do Produto Premium
                        </h3>
                        
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal text-left">
                          As canecas da <strong className="text-[#C8A66A]">Quality Canecas</strong> são desenvolvidas sob condições estritas de cozimento e cozidas com sublimação a vácuo de temperatura ultra-alta, garantindo brilho impecável e durabilidade vitalícia. Cada modelo utiliza cerâmica importada de paredes espessas classe AAA+, eliminando rugosidades e alcançando nitidez e saturação fidedignas do seu arquivo de imagem original ou do nosso portfólio oficial.
                        </p>

                        <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 sm:p-5 space-y-2.5">
                          <h4 className="text-xs font-extrabold text-[#7A5B2C] uppercase flex items-center gap-1.5 font-sans leading-none text-left">
                            <span>🛡️</span> Seguro Especial de Envio Sem Custos
                          </h4>
                          <p className="text-[11px] text-[#7A5B2C] font-medium leading-relaxed text-left">
                            Sabemos que porcelana é frágil e acidentes acontecem nas transportadoras. Por isso, oferecemos o <strong>Seguro Contra Danos de Envio Quality</strong>: Se qualquer peça do seu pedido chegar danificada, trincada ou quebrada, basta enviar uma foto do estado físico no WhatsApp e nós te enviamos uma caneca novinha em folha no frete express sem nenhuma burocracia ou cobrança adicional.
                          </p>
                        </div>
                      </div>

                      {/* Right: Technical specifications table sheet */}
                      <div className="md:col-span-4 bg-stone-50 rounded-2xl border border-stone-200 p-5 space-y-4 text-left">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#B8863B] border-b border-stone-200 pb-2 flex items-center gap-1">
                          <span>🔬</span> Ficha Técnica Completa
                        </h4>
                        <div className="space-y-3 font-sans text-xs">
                          <div className="flex justify-between items-center py-1 border-b border-stone-150/60 text-stone-600">
                            <span>Material:</span>
                            <span className="font-extrabold text-stone-850">Porcelana AAA+</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-stone-150/60 text-stone-600">
                            <span>Capacidade:</span>
                            <span className="font-bold font-mono">325 ml</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-stone-150/60 text-stone-600">
                            <span>Altura:</span>
                            <span className="font-bold font-mono">9,5 cm</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-stone-150/60 text-stone-600">
                            <span>Diâmetro:</span>
                            <span className="font-bold font-mono">8,0 cm</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-stone-150/60 text-stone-600">
                            <span>Peso (Aprox.):</span>
                            <span className="font-bold font-mono">350g</span>
                          </div>
                          <div className="flex justify-between items-center py-1 text-stone-600">
                            <span>Embalagem:</span>
                            <span className="font-extrabold text-stone-850">Papelão Kraft Reforçado</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO DOWNSTREAM 2: PROMOÇÃO / MAIS OPÇÕES DE COMPRA RELACIONADAS (4 CARD GRID) */}
                  <div className="border-t border-stone-200 pt-8 mt-6">
                    <h3 className="text-sm font-black uppercase text-stone-700 tracking-wider mb-5 flex items-center gap-1.5 text-left">
                      <span>🛍️</span> QUEM COMPROU, TAMBÉM LEVOU OUTROS PRODUTOS DO SEGMENTO:
                    </h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 text-left select-none">
                      {relatedItems.map((rel, rIdx) => (
                        <div
                          key={`related-product-${rIdx}`}
                          onClick={() => {
                            if (rel.type === 'gallery') {
                              setSelectedGalleryIndex(rel.originalIndex);
                              setSelectedAvailableMugIndex(null);
                            } else {
                              setSelectedAvailableMugIndex(rel.originalIndex);
                              setSelectedGalleryIndex(null);
                            }
                            setActivePhotoIdx(0);
                            
                            // Scroll the product detail page dialog back to top smoothly
                            document.getElementById("quality-product-details-page")?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-[#C8A66A] hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between h-full p-2.5 sm:p-3"
                        >
                          <div className="aspect-square rounded-xl bg-stone-50 overflow-hidden flex items-center justify-center p-2 border border-stone-100">
                            <img
                              src={rel.image}
                              alt={rel.title}
                              className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="mt-2 text-left space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="bg-[#C8A66A]/10 text-[#7A5B2C] text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                                {rel.badge}
                              </span>
                            </div>
                            <h4 className="text-[11px] font-bold text-stone-900 group-hover:text-[#B8863B] truncate leading-tight uppercase font-sans">
                              {rel.title}
                            </h4>
                            <div className="flex items-baseline justify-between pt-0.5">
                              <span className="text-[10px] text-stone-400 line-through">De R$ {getProductPrice(rel.title) === 5.00 ? '19,90' : '69,90'}</span>
                              <span className="text-[#C8A66A] text-xs font-black font-mono">R$ {getProductPrice(rel.title).toFixed(2).replace('.', ',')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer Section */}
                <div className="w-full bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 font-sans gap-2 text-left">
                  <span>© 2026 Quality Canecas Personalizadas. Todos os direitos reservados.</span>
                  <div className="flex gap-4">
                    <span className="hover:text-stone-600 cursor-pointer">Termos de Uso</span>
                    <span className="hover:text-stone-600 cursor-pointer">Garantias & Envios</span>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

               {/* 🔐 PORTAL EXCLUSIVO: CÁPSULA DE CHECKOUT SEGURO & INTEGRAÇÃO DE CHECKOUT TRANSPARENTE */}
      <AnimatePresence>
        {activeCheckoutLink !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#f4f6f8] z-[150] font-sans overflow-y-auto overflow-x-hidden w-full h-full"
            id="portal-de-pagamento-blindado"
          >


            {/* 2. Conteúdo Principal do Checkout Transparente Asaas integrado */}
            <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#f4f6f8] min-h-screen w-full">
                
                {/* LADO ESQUERDO: Painel Integrador de Gateways (Asaas / Pushin Pay) e Supabase */}
                {false && (
                  <div className="lg:col-span-4 bg-stone-950 border-r border-[#C8A66A]/20 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto space-y-6">
                  
                  <div className="space-y-5">
                    
                    {/* Cabeçalho do Módulo de Integração Unificado */}
                    <div className="p-4 bg-stone-900/60 rounded-xl border border-[#C8A66A]/30 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#C8A66A]/5 rounded-full filter blur-md" />
                      <span className="text-[9px] bg-[#C8A66A]/10 text-[#E6C687] font-mono border border-[#C8A66A]/20 px-2 py-0.5 rounded uppercase font-black tracking-widest leading-none">
                        INTEGRAÇÃO OFICIAL
                      </span>
                      <h4 className="text-sm font-black font-sans text-white uppercase tracking-tight mt-2 flex items-center gap-1.5">
                        <span>Asaas API Checkout 💳</span>
                      </h4>
                      <p className="text-[10px] text-stone-400 mt-1 leading-normal">
                        Módulo de faturamento próprio. Pix dinâmico, cartões de crédito e boletos registrados sem intermediários.
                      </p>
                    </div>

                    {/* Credenciais do Gateway Asaas */}
                    <div className="p-4 bg-stone-900 border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#E6C687] font-black uppercase tracking-wider font-sans">
                          Configurações Asaas API
                        </span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={asaasSandbox}
                            onChange={(e) => setAsaasSandbox(e.target.checked)}
                            className="w-3.5 h-3.5 rounded bg-black border-white/20 text-[#C8A66A] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-[10px] text-stone-300 font-extrabold uppercase font-mono tracking-wider">Sandbox</span>
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-stone-400 font-bold uppercase block font-mono tracking-wider">
                          Chave API Privada / Token:
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="password"
                            value={asaasApiKey}
                            onChange={(e) => setAsaasApiKey(e.target.value)}
                            placeholder="$asaas_prod_secret_token..."
                            className="flex-1 bg-stone-950 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8A66A] font-mono"
                          />
                          <button
                            onClick={() => {
                              if (asaasApiKey) {
                                alert("Chave Asaas salva para simulação local! O ambiente de produção utilizará a credencial segura ASAAS_API_KEY do servidor para segurança absoluta.");
                              } else {
                                alert("Insira uma chave simulada!");
                              }
                            }}
                            className="bg-white/10 text-[#E6C687] border border-white/10 font-bold hover:bg-[#C8A66A] hover:text-stone-950 text-[10px] px-3.5 rounded cursor-pointer transition-colors"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 🔬 AMBIENTE DE TESTES DO DESENVOLVEDOR (SANDBOX & SIMULAÇÕES) */}
                    <div className="p-5 bg-stone-900 border border-[#C8A66A]/40 rounded-2xl space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <h4 className="text-xs sm:text-sm font-black text-[#E6C687] uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                          <span className="text-sm">🔬</span> AMBIENTE DE TESTE DO CHECKOUT
                        </h4>
                        <span className="text-[10px] bg-[#C8A66A]/20 text-white px-2.5 py-1 rounded-full font-mono font-black uppercase tracking-wider">
                          SANDBOX LIVE
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        {/* Status das APIs */}
                        <div className="bg-black border border-white/5 rounded-xl p-3 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-300 font-mono font-medium">Gateway Asaas:</span>
                            {backendConfig?.hasAsaas ? (
                              <span className="text-emerald-400 font-black flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                                {backendConfig.isAsaasSandbox ? "CONECTADO (SANDBOX)" : "CONECTADO (PRODUÇÃO)"}
                              </span>
                            ) : (
                              <span className="text-amber-300 font-black">SIMULATION FALLBACK</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-200 font-mono font-medium">Melhor Envio:</span>
                            {backendConfig?.hasMelhorEnvio ? (
                              <span className="text-emerald-400 font-black flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                                CONECTADO (FRETE REAL)
                              </span>
                            ) : (
                              <span className="text-amber-400 font-black">FRETE SIMULADO ATIVO</span>
                            )}
                          </div>
                        </div>

                        {/* Massa de Testes Rápida */}
                        <div className="space-y-3.5">
                          {/* Botão de Preenchimento Unificado */}
                          <div>
                            <span className="text-[11px] text-[#E6C687] font-black uppercase tracking-wider block mb-1.5 font-mono">
                              Passo 1: Identificação do Comprador
                            </span>
                            <button
                              onClick={() => {
                                setCustName("José Silva Santos");
                                setCustEmail("teste.checkout@qualitycanecas.com.br");
                                setCustCpf("142.598.632-11");
                                setCustPhone("(11) 99876-5432");
                                alert("Dados de faturamento fictícios aplicados ao formulário!");
                              }}
                              className="w-full py-2 px-3 bg-[#C8A66A]/20 hover:bg-[#C8A66A] text-[#E6C687] hover:text-stone-950 text-xs font-black rounded-xl border border-[#C8A66A]/40 transition-all text-center uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>👤 Autopreencher Comprador</span>
                            </button>
                          </div>

                          {/* Botões do CEP / Seguro Frete */}
                          <div>
                            <span className="text-[11px] text-[#E6C687] font-black uppercase tracking-wider block mb-1.5 font-mono">
                              Passo 2: CEPs de Teste (Cálculo de Frete)
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => {
                                  handleCepChange("30110010");
                                  alert("Preenchido CEP de Belo Horizonte, MG (Origem)!");
                                }}
                                className="py-2 px-1.5 bg-stone-800 hover:bg-[#C8A66A] hover:text-stone-950 text-white border border-white/10 rounded-lg text-xs font-black transition-all truncate cursor-pointer uppercase tracking-wider"
                                title="Belo Horizonte, MG"
                              >
                                BH (Local)
                              </button>
                              <button
                                onClick={() => {
                                  handleCepChange("01310100");
                                  alert("Preenchido CEP de São Paulo, SP (Avenida Paulista)!");
                                }}
                                className="py-2 px-1.5 bg-stone-800 hover:bg-[#C8A66A] hover:text-stone-950 text-white border border-white/10 rounded-lg text-xs font-black transition-all truncate cursor-pointer uppercase tracking-wider"
                                title="São Paulo, SP"
                              >
                                SP (Capital)
                              </button>
                              <button
                                onClick={() => {
                                  handleCepChange("60060390");
                                  alert("Preenchido CEP de Fortaleza, CE (Longa Distância)!");
                                }}
                                className="py-2 px-1.5 bg-stone-800 hover:bg-[#C8A66A] hover:text-stone-950 text-white border border-white/10 rounded-lg text-xs font-black transition-all truncate cursor-pointer uppercase tracking-wider"
                                title="Fortaleza, CE"
                              >
                                CE (Nordeste)
                              </button>
                            </div>
                            <p className="text-[10px] text-stone-300 mt-1.5 font-sans leading-relaxed">
                              *Clique para consultar e calcular taxas de frete PAC e SEDEX automaticamente.
                            </p>
                            
                            {/* Simulador de Frete Grátis na Loja para Teste */}
                            <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between select-none">
                              <div className="flex flex-col text-left">
                                <span className="text-[10px] text-[#E6C687] font-black uppercase tracking-wider font-mono block leading-tight">
                                  Simulação: Forçar Frete Grátis
                                </span>
                                <span className="text-[8px] text-stone-400 font-sans leading-tight mt-0.5 block">
                                  Mantém cálculo do endereço mas zera o custo
                                </span>
                              </div>
                              <input
                                id="force-free-shipping-toggle"
                                type="checkbox"
                                checked={forceFreeShipping}
                                onChange={(e) => setForceFreeShipping(e.target.checked)}
                                className="w-4 h-4 rounded text-[#C8A66A] bg-stone-900 border-white/10 focus:ring-[#C8A66A] focus:ring-2 cursor-pointer accent-[#C8A66A] shrink-0"
                              />
                            </div>
                          </div>

                          {/* Cartão de Crédito Homologação */}
                          <div>
                            <span className="text-[11px] text-[#E6C687] font-black uppercase tracking-wider block mb-1.5 font-mono">
                              Passo 3: Cartão de Homologação Asaas
                            </span>
                            <div className="bg-black border border-white/5 rounded-xl p-3 flex flex-col justify-between items-stretch gap-2.5">
                              <div className="text-xs text-stone-200 font-mono flex justify-between">
                                <span>Cartão: <strong className="text-[#E6C687] font-black">4012 0000 0000 0000</strong></span>
                                <span>CVV: <strong className="text-[#E6C687] font-black">123</strong></span>
                              </div>
                              <button
                                onClick={() => {
                                  setCustPaymentMethod('card');
                                  setCardNumber("4012 0000 0000 0000");
                                  setCardHolder("JOSE SILVA SANTOS");
                                  setCardExpiry("12/30");
                                  setCardCvv("123");
                                  alert("Cartão de simulação inserido e aba de cartão selecionada!");
                                }}
                                className="w-full py-2 bg-[#C8A66A] hover:bg-[#B8863B] text-stone-950 font-black text-xs rounded-lg uppercase tracking-widest transition-all text-center cursor-pointer"
                              >
                                💳 Inserir Cartão Homologação
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    <h3 className="text-stone-400 text-[10px] uppercase tracking-widest font-bold mb-1">
                      Fases do Checkout Blindado
                    </h3>

                    {/* Alinhamento de Etapas de Processamento em Tempo Real 2026 */}
                    <div className="space-y-2.5 select-none">
                      
                      <div className="flex gap-2.5 p-2.5 rounded-xl border border-[#C8A66A]/20 bg-gradient-to-r from-[#C8A66A]/5 to-transparent">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Identificação do Cliente</h4>
                          <p className="text-[9px] text-stone-400 leading-tight">
                            Seus dados cadastrais salvos de forma encriptada SSL.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2.5 p-2.5 rounded-xl border border-[#C8A66A]/20 bg-gradient-to-r from-[#C8A66A]/5 to-transparent font-sans">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Entrega Correios</h4>
                          <p className="text-[9px] text-stone-400 leading-tight">
                            Consultas em milissegundos via API ativa do melhor envio.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2.5 p-2.5 rounded-xl border border-[#C8A66A]/20 bg-gradient-to-r from-[#C8A66A]/5 to-transparent font-sans">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Faturamento &amp; Gateway</h4>
                          <p className="text-[9px] text-stone-400 leading-tight">
                            Transações diretas blindadas sem redirects perigosos.
                          </p>
                        </div>
                      </div>

                    </div>

                    <div className="p-3 rounded-lg border border-white/5 bg-stone-900/30 text-[10px] leading-relaxed text-stone-400">
                      <div className="text-[#C8A66A] font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                        <span className="text-xs">🛡️</span>
                        <span>API de Checkout Direta</span>
                      </div>
                      Com a API do <strong className="text-white">Asaas</strong>, as informações financeiras não passam pelo servidor do site. O Pix e faturamentos são gerados instantaneamente via chamada HTTP REST protegida!
                    </div>

                  </div>

                  {/* Rodapé Informativo */}
                  <div className="border-t border-white/10 pt-3 flex flex-col gap-1 select-none">
                    <span className="text-[9px] font-mono text-stone-500">APIS CONECTADAS AO SISTEMA:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[8px] font-bold rounded">VIA CEP API</span>
                      <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-bold rounded">MELHOR ENVIO API</span>
                      <span className="px-1.5 py-0.5 text-[8px] font-bold rounded border bg-blue-500/10 border-blue-500/20 text-blue-400">
                        ASAAS API GATEWAY
                      </span>
                    </div>
                  </div>

                </div>
                )}

                {/* LADO DIREITO: Formuário Dinâmico de Checkout */}
                <div className="lg:col-span-12 w-full max-w-7xl mx-auto bg-[#f4f6f8] p-2.5 sm:p-8 flex flex-col justify-start items-center max-w-full relative min-h-screen">
                  
                  <div className={`w-full max-w-full ${isOrderPlaced ? 'bg-stone-950/85 border border-[#C8A66A]/20 text-white' : 'bg-white border border-slate-200/80 text-stone-900'} rounded-xl xs:rounded-2xl p-3 xs:p-5.5 sm:p-8 shadow-2xl relative z-10 transition-all duration-300 ${isOrderPlaced ? 'max-w-3xl font-sans' : 'max-w-6xl font-sans'} overflow-hidden`}>
                    
                    {/* BOTÃO VOLTAR/SAIR ABSOLUTO COMPACTO (0px de espaço vertical ocupado, maximizando a área do relógio e formulários!) */}
                    <button
                      onClick={() => {
                        setActiveCheckoutLink(null);
                        setActiveCheckoutName(null);
                        setActiveCheckoutImage(null);
                        setCheckoutStep(1);
                        setIsOrderPlaced(false);
                        setPixCopied(false);
                        setIsLojistaUnlocked(false);
                      }}
                      className={`absolute top-3 right-3 sm:top-5 sm:right-5 z-50 p-2 rounded-full border transition-all cursor-pointer shadow-sm ${
                        isOrderPlaced 
                          ? 'bg-stone-900 border-white/10 text-stone-400 hover:text-white hover:bg-stone-800' 
                          : 'bg-slate-50 border-slate-200/60 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isOrderPlaced ? "Voltar" : "Fechar e voltar à loja"}
                      aria-label="Fechar e voltar à loja"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Exibe se o faturamento ja foi gerado */}
                    {isOrderPlaced ? (
                      /* ========================================================================= */
                      /* PÁGINA DE OBRIGADO DE ALTA FIDELIDADE: PEDIDO CONFIRMADO & FATURADO      */
                      /* ========================================================================= */
                      <div className="text-left space-y-6 animate-fadeIn select-none font-sans">
                        
                        {/* Cabeçalho de Sucesso GERAL */}
                        <div className="flex flex-col md:flex-row items-center border-b border-white/10 pb-5 gap-4">
                          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                            <ShieldCheck className="w-8 h-8" />
                          </div>
                          <div className="text-center md:text-left flex-1">
                            <span className="text-[10px] px-2.5 py-1 bg-[#C8A66A]/20 text-[#E6C687] rounded-full font-mono font-bold tracking-widest uppercase border border-[#C8A66A]/30">
                              Faturamento Concluído em Ambiente Seguro
                            </span>
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide mt-1.5 leading-tight">
                              Pedido Registrado com Sucesso! 🎉
                            </h3>
                            <p className="text-stone-300 text-xs mt-1">
                              Obrigado por comprar na <strong className="text-[#C8A66A]">Quality Canecas</strong>. Sua solicitação foi recebida com segurança via Asaas API.
                            </p>
                          </div>
                          <div className="bg-stone-900 border border-white/5 py-1.5 px-3 rounded-lg text-right shrink-0">
                            <span className="text-stone-400 text-[8px] block font-mono uppercase">Ref. do Pedido</span>
                            <span className="text-white font-mono text-xs font-black">#QY-{(Date.now() % 1000000).toString().padStart(6, '0')}</span>
                          </div>
                        </div>

                        {/* Layout de Duas Colunas da Página de Obrigado */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          
                          {/* Coluna Esquerda: Ações do Pagamento & Próximo Passo */}
                          <div className="col-span-full md:col-span-7 space-y-6">
                            
                            {/* PASSO A PASSO INTERATIVO */}
                            <div className="bg-stone-900/60 rounded-2xl border border-white/5 p-5 space-y-6">
                              
                              {/* PASSO 1: PAGAMENTO */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                  <span className="w-5 h-5 rounded-full bg-[#C8A66A]/20 border border-[#C8A66A]/40 text-[#E6C687] text-xs font-black flex items-center justify-center font-mono">1</span>
                                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Efetuar o Faturamento do Lote</h4>
                                </div>

                                <div className="flex bg-stone-950/60 p-1 rounded-xl gap-1 border border-white/5 w-full select-none mb-3">
                                  <button
                                    onClick={() => setCustPaymentMethod('pix_pushin')}
                                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-extrabold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                      custPaymentMethod === 'pix_pushin' ? 'bg-[#32bcad]/25 text-teal-300 border border-[#32bcad]/40' : 'text-stone-400 hover:text-white hover:bg-stone-900/50'
                                    }`}
                                  >
                                    <span>⚡</span> PIX
                                  </button>
                                  <button
                                    onClick={() => setCustPaymentMethod('card')}
                                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-extrabold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                      custPaymentMethod === 'card' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-stone-400 hover:text-white hover:bg-stone-900/50'
                                    }`}
                                  >
                                    <span>💳</span> CARTÃO
                                  </button>
                                  <button
                                    onClick={() => setCustPaymentMethod('boleto')}
                                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-extrabold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                      custPaymentMethod === 'boleto' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-stone-400 hover:text-white hover:bg-stone-900/50'
                                    }`}
                                  >
                                    <span>📄</span> BOLETO
                                  </button>
                                </div>

                                {/* Se PIX */}
                                {custPaymentMethod === 'pix_pushin' && (
                                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-4">
                                    
                                    <div className="flex items-center justify-between text-xs bg-[#C8A66A]/10 border border-[#C8A66A]/20 px-3 py-2 rounded-lg text-amber-300">
                                      <span className="font-medium">O Pix expira em breve:</span>
                                      <span className="font-mono font-bold">⏳ {formatPixTime(pixTimeLeft)}</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                      {/* QR Code */}
                                      <div className="bg-white p-2.5 rounded-xl shrink-0 w-28 h-28 flex items-center justify-center relative shadow-md">
                                        <img 
                                          src={paymentResponse?.pix?.encodedImage 
                                            ? `data:image/png;base64,${paymentResponse.pix.encodedImage}`
                                            : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=000000&data=${encodeURIComponent(paymentResponse?.pix?.payload || `00020101021226870014br.gov.bcb.pix2565pushinpay.com.br/qrc/quality-mugs-${(activeCheckoutName || 'maezona').toLowerCase().replace(/\s+/g, '-')}-pix-secured-2026`)}`
                                          }
                                          alt="PIX QR Code"
                                          className="w-full h-full object-contain rounded-lg p-0.5"
                                        />
                                      </div>

                                      <div className="text-left space-y-1.5 flex-1 w-full text-xs">
                                        <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Como pagar o Pix?</h5>
                                        <p className="text-stone-400 leading-relaxed text-[11px]">
                                          Abra o aplicativo de pagamento do seu banco, escolha a opção <strong>"Pagar via Pix / Copia e Cola"</strong> ou <strong>"Ler QR Code"</strong> e finalize agora mesmo para aprovação automática.
                                        </p>
                                      </div>
                                    </div>

                                    {/* Código Copia e Cola */}
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">Código Pix Copia e Cola:</span>
                                      <div className="flex gap-2">
                                        <input
                                          readOnly
                                          type="text"
                                          value={paymentResponse?.pix?.payload || `00020101021226870014br.gov.bcb.pix2565pushinpay.com.br/qrc/quality-mugs-${activeCheckoutName?.toLowerCase().replace(/\s+/g, '-')}-pix-secured-2026`}
                                          className="flex-1 bg-stone-900 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono text-stone-300 focus:outline-none truncate"
                                        />
                                        <button
                                          onClick={() => {
                                            try {
                                              navigator.clipboard.writeText(paymentResponse?.pix?.payload || `00020101021226870014br.gov.bcb.pix2565pushinpay.com.br/qrc/quality-mugs-${activeCheckoutName?.toLowerCase().replace(/\s+/g, '-')}-pix-secured-2026`);
                                              setPixCopied(true);
                                              setTimeout(() => setPixCopied(false), 2500);
                                            } catch (e) {
                                              console.error(e);
                                            }
                                          }}
                                          className="bg-[#C8A66A] hover:bg-[#B8863B] text-stone-950 font-bold text-[10px] px-3.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer uppercase tracking-wider"
                                        >
                                          {pixCopied ? '✓ Copiado!' : 'Copiar Chave'}
                                        </button>
                                      </div>
                                    </div>

                                  </div>
                                )}

                                {/* Se InfinitePay */}
                                {custPaymentMethod === 'infinitepay' && (
                                  <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-xl p-4 space-y-3">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase rounded font-mono">
                                      💳 REDIRECIONADO PARA INFINITEPAY
                                    </div>
                                    <p className="text-xs text-stone-300 leading-relaxed">
                                      Seu pedido da caneca <strong>{activeCheckoutName}</strong> foi registrado em nosso banco de dados da faturamento! 
                                      Você já pode efetuar o pagamento da transação direto no Checkout Oficial da InfinitePay.
                                    </p>
                                    {activeCheckoutLink && (
                                      <a
                                        href={activeCheckoutLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C8A66A] hover:bg-[#B8863B] text-stone-950 font-black text-xs uppercase rounded-lg transition-all shadow-md mt-2"
                                      >
                                        Ir para Faturamento Seguro InfinitePay ➔
                                      </a>
                                    )}
                                  </div>
                                )}

                                {/* Se Cartão */}
                                {custPaymentMethod === 'card' && (
                                  <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-xl p-4 space-y-2">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase rounded font-mono">
                                      💳 CARTÃO DE CRÉDITO Aprovado
                                    </div>
                                    <p className="text-xs text-stone-300 leading-relaxed text-justify">
                                      O faturamento via cartão em nome de <strong className="text-white">{custName}</strong> foi validado com êxito e já se encontra aprovado. O valor total virá indicado em sua fatura.
                                    </p>
                                  </div>
                                )}

                                {custPaymentMethod === 'boleto' && (
                                  <div className="bg-stone-950/60 border border-white/5 rounded-xl p-4 space-y-3">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/35 text-amber-400 font-bold text-[10px] uppercase rounded font-mono">
                                      📄 BOLETO BANCÁRIO REGISTRADO
                                    </div>
                                    <p className="text-[11px] text-stone-300 leading-normal">
                                      O boleto foi emitido em nome de <strong className="text-white">{custName}</strong> e já se encontra registrado no Banco Central de forma protegida. Veja a linha digitável abaixo:
                                    </p>
                                    <div className="p-2.5 bg-black rounded-lg border border-white/5 font-mono text-[9px] text-stone-400 break-all select-all">
                                      {paymentResponse?.boleto?.barCode || "34191.79001 01043.513184 91020.150008 7 981500000" + Math.floor((((getProductPrice(activeCheckoutName) * productQty) + (orderBumpSelected ? 12.90 : 0) + (upsellAccepted ? 19.90 : 0)) * (exitIntentDiscountApplied ? 0.9 : 1.0) + (custSelectedShipping === 'pac' ? shippingPacPrice : shippingSedexPrice)) * 100).toString().padStart(5, "0")}
                                    </div>
                                    
                                    {paymentResponse?.boleto ? (
                                      <div className="space-y-2.5 mt-2">
                                        <button
                                          type="button"
                                          onClick={() => setShowEmbeddedBoletoModal(true)}
                                          className="block w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-xs font-black rounded-xl text-center uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer border border-amber-300/30 font-sans"
                                        >
                                          Visualizar Boleto Online (Sem Senha/Login) 🧾
                                        </button>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-[9px] pt-1">
                                          {paymentResponse.boleto.invoiceUrl && (
                                            <a
                                              href={paymentResponse.boleto.invoiceUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="py-1.5 px-1 bg-stone-900/60 hover:bg-stone-800 border border-white/5 text-stone-400 hover:text-stone-300 text-center rounded uppercase tracking-wide truncate transition-colors cursor-pointer"
                                              title="Abrir fatura de testes externa"
                                            >
                                              Link Fatura Asaas 🔗
                                            </a>
                                          )}
                                          {paymentResponse.boleto.pdfUrl && (
                                            <a
                                              href={paymentResponse.boleto.pdfUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="py-1.5 px-1 bg-stone-900/60 hover:bg-stone-800 border border-white/5 text-stone-400 hover:text-stone-300 text-center rounded uppercase tracking-wide truncate transition-colors cursor-pointer"
                                              title="Baixar boleto simulado no navegador"
                                            >
                                              Baixar PDF Direto 📥
                                            </a>
                                          )}
                                        </div>

                                        <p className="text-[10px] text-stone-400 leading-normal text-center italic opacity-85 border-t border-white/5 pt-2">
                                          * <strong>Dica de Teste Sandbox:</strong> Os links externos de sandbox de banco exigem login ou cookies do painel. Use o <strong>botão amarelo principal acima</strong> para ver o boleto completo e correto de forma direta! Na produção, nenhum comprador precisará de logins e a página externa funcionará perfeitamente e de forma pública.
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-2 mt-2">
                                        <button
                                          type="button"
                                          onClick={() => setShowEmbeddedBoletoModal(true)}
                                          className="block w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-xs font-black rounded-xl text-center uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer font-sans"
                                        >
                                          Visualizar Boleto Simulador 🧾
                                        </button>
                                        <p className="text-[9px] text-stone-400 text-center leading-normal italic">
                                          Boleto em demonstração. Na produção o link real do Asaas redirecionará para o PDF oficial do Banco de forma pública.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                              </div>

                              {/* PASSO 2: CONTATO WHATSAPP */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#25D366] text-xs font-black flex items-center justify-center font-mono animate-pulse">2</span>
                                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Criar seu Modelo de Arte no WhatsApp (Muito Importante)</h4>
                                </div>

                                <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
                                  A <strong className="text-[#C8A66A]">Quality Canecas</strong> trabalha com modelagem exclusiva sob demanda. Clique no botão especial verde abaixo para enviar seu logotipo, nome, foto ou frase diretamente ao designer no WhatsApp que criará e enviará seu modelo 3D virtual sem custos adicionais:
                                </p>

                                <button
                                  onClick={() => {
                                    const devShipping = custSelectedShipping === 'pac' ? shippingPacPrice : shippingSedexPrice;
                                    const originalSubtotal = (getProductPrice(activeCheckoutName) * productQty) + (orderBumpSelected ? 12.90 : 0) + (upsellAccepted ? 19.90 : 0);
                                    const discountAmount = exitIntentDiscountApplied ? (originalSubtotal * 0.1) : 0;
                                    const finalAmount = originalSubtotal - discountAmount + devShipping;
                                    const extrasMsg = `${orderBumpSelected ? ' e o Porta-Copo Emborrachado' : ''}${upsellAccepted ? ' com a Promoção da Segunda Caneca' : ''}${exitIntentDiscountApplied ? ' [Cupom 10% Aplicado]' : ''}`;
                                    
                                    let payMethodText = 'Pix';
                                    if (custPaymentMethod === 'card') payMethodText = 'Cartão de Crédito';
                                    if (custPaymentMethod === 'boleto') payMethodText = 'Boleto Bancário';

                                    const personalMsg = `${customPhotoName ? `\n📸 Foto Anexada: *[${customPhotoName}]* (Disponível no Faturamento)` : ''}${customText ? `\n✏️ Detalhes da Arte: *"${customText}"*` : ''}`;

                                    const msgText = `Olá! Meu nome é *${custName}* e acabei de concluir o faturamento do meu pedido seguro via *${payMethodText}* no site.\n\n*Detalhes do Pedido:*\n☕ Produto: *${productQty}x ${activeCheckoutName}*${personalMsg}${extrasMsg}\n💰 Total: *R$ ${finalAmount.toFixed(2).replace('.', ',')}*\n👤 Cliente CPF: *${custCpf}*\n📫 Endereço: *${custStreet}, nº ${custNumber} - ${custCity}/${custState}*\n\nEstou enviando o faturamento para iniciar a criação da minha arte personalizada!`;
                                    
                                    handleWhatsAppRedirect({
                                      type: 'Finalizado',
                                      text: activeCheckoutName || 'Caneca Personalizada',
                                      sub: msgText
                                    });
                                  }}
                                  className="w-full py-4 px-4 bg-[#25D366] hover:bg-[#128C7E] hover:scale-[1.015] active:scale-95 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-[#25D366]/30 font-sans"
                                >
                                  <MessageSquare className="w-5 h-5 animate-bounce shrink-0" />
                                  <span>ENVIAR IDEIA DA ARTE VIA WHATSAPP (CLIQUE AQUI) ✓</span>
                                </button>
                              </div>

                              {/* PASSO 3: ENTREGA */}
                              <div className="space-y-2 text-[11px] leading-relaxed text-stone-400">
                                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                  <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-stone-300 text-xs font-black flex items-center justify-center font-mono">3</span>
                                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Processamento e Despacho de Encomenda</h4>
                                </div>
                                <p className="font-sans">
                                  Assim que sua arte for validada pelo setor de design, a peça entra para a prensa de fusão térmica de alta definição. Nossa equipe realiza o embalo com dupla camada protetora anti-impacto para garantir que sua mug chegue perfeitamente intacta. Seu link de rastreamento do Melhor Envio será despachado via e-mail (<span className="text-white font-medium">{custEmail}</span>).
                                </p>
                              </div>

                            </div>

                          </div>
                          
                          {/* Coluna Direita: Recibo Financeiro Detalhado & Destinatário */}
                          <div className="col-span-full md:col-span-5 space-y-4">
                            
                            {/* RECIBO DO PEDIDO */}
                            <div className="bg-stone-900 rounded-2xl border border-[#C8A66A]/20 p-5 space-y-4">
                              <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                                <h4 className="text-xs font-black text-[#E6C687] uppercase tracking-widest">Resumo Financeiro</h4>
                                <span className="text-[9px] uppercase font-mono text-stone-400">Lote Oficial</span>
                              </div>

                              {/* Lista de Itens do Recibo */}
                              <div className="space-y-2.5">
                                {isCartActive ? (
                                  cartItems.map((item: any, idx: number) => (
                                    <div key={`ty-item-${idx}`} className="flex items-center justify-between text-xs text-stone-300 bg-stone-950/20 p-1.5 px-2 rounded">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-[#C8A66A] text-xs shrink-0 select-none">☕</span>
                                        <span className="truncate font-medium uppercase text-[10px] tracking-wide text-stone-200">
                                          {item.qty}x {item.title}
                                        </span>
                                      </div>
                                      <span className="font-mono text-white text-xs font-bold leading-none select-none">R$ {((item.price || getProductPrice(item.title) || 45.90) * item.qty).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center justify-between text-xs text-stone-300">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="text-[#C8A66A] text-xs shrink-0 select-none">☕</span>
                                      <span className="truncate font-medium uppercase text-[11px] tracking-wide text-stone-200">
                                        {productQty > 1 ? `${productQty}x ` : ''}{activeCheckoutName}
                                      </span>
                                    </div>
                                    <span className="font-mono text-white text-xs font-bold leading-none select-none">R$ {baseMugsSubtotal.toFixed(2).replace('.', ',')}</span>
                                  </div>
                                )}

                                {orderBumpSelected && (
                                  <div className="flex items-center justify-between text-xs text-emerald-400 pl-4 bg-emerald-500/5 py-1 px-1.5 rounded border border-emerald-500/10">
                                    <span className="text-[10px] uppercase font-bold tracking-wide">
                                      🎁 Porta-Copo Premium
                                    </span>
                                    <span className="font-mono text-white text-xs font-bold">R$ 12,90</span>
                                  </div>
                                )}

                                {upsellAccepted && (
                                  <div className="flex items-center justify-between text-xs text-[#C8A66A] pl-4 bg-[#C8A66A]/5 py-1 px-1.5 rounded border border-[#C8A66A]/15 animate-fadeIn">
                                    <span className="text-[10px] uppercase font-bold tracking-wide">
                                      🔥 Segunda Caneca Quality
                                    </span>
                                    <span className="font-mono text-white text-xs font-bold">R$ 19,90</span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-stone-300">
                                  <span className="text-stone-400 uppercase text-[10px] pl-4">
                                    Frete ({custSelectedShipping.toUpperCase()} Melhor Envio)
                                  </span>
                                  <span className="font-mono text-white font-medium">
                                    {isFreteGratis ? 'GRÁTIS' : `R$ ${(custSelectedShipping === 'pac' ? shippingPacPrice : shippingSedexPrice).toFixed(2).replace('.', ',')}`}
                                  </span>
                                </div>

                                {orderBumpGiftSelected && (
                                  <div className="flex items-center justify-between text-xs text-amber-500 pl-4 bg-amber-500/5 py-1 px-1.5 rounded border border-amber-500/10 animate-fadeIn">
                                    <span className="text-[10px] uppercase font-bold tracking-wide">
                                      🪵 Estojo de Luxo MDF
                                    </span>
                                    <span className="font-mono text-white text-xs font-bold font-mono">R$ 9,90</span>
                                  </div>
                                )}

                                {orderBumpPrioritySelected && (
                                  <div className="flex items-center justify-between text-xs text-cyan-400 pl-4 bg-cyan-500/5 py-1 px-1.5 rounded border border-cyan-500/10 animate-fadeIn">
                                    <span className="text-[10px] uppercase font-bold tracking-wide">
                                      🚀 Prensa e Despacho VIP
                                    </span>
                                    <span className="font-mono text-white text-xs font-bold font-mono">R$ 6,95</span>
                                  </div>
                                )}

                              </div>

                              {/* Desconto do cupom se aplicável */}
                              {exitIntentDiscountApplied && (
                                <div className="flex items-center justify-between text-xs text-emerald-500 pl-4 bg-emerald-500/5 py-1 px-1.5 rounded border border-emerald-500/10 animate-fadeIn">
                                  <span className="text-[10px] uppercase font-bold tracking-wide">
                                    🎁 CUPOM "RVXYRQH6S" (10% OFF)
                                  </span>
                                  <span className="font-mono text-emerald-400 font-bold">
                                    - R$ {discountAmount.toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                              )}

                              {/* Totalizador Realizado */}
                              <div className="border-t border-white/10 pt-3 flex items-center justify-between bg-stone-950 p-3 rounded-xl border border-white/5">
                                <span className="text-xs font-extrabold uppercase text-[#C8A66A] tracking-wider">TOTAL IMPRESSO:</span>
                                <span className="text-base font-black text-white font-mono">
                                  R$ {finalAmountValue.toFixed(2).replace('.', ',')}
                                </span>
                              </div>

                              {/* Dados Cadastrais do Destinatário */}
                              <div className="text-[10px] text-stone-400 border-t border-white/5 pt-3 space-y-1.5 font-sans leading-relaxed">
                                <span className="text-[#C8A66A] font-extrabold uppercase text-[9px] tracking-wider block">Endereço de Entrega Selecionado:</span>
                                <div><strong className="text-stone-300">Responsável:</strong> {custName}</div>
                                <div><strong className="text-stone-300">CPF:</strong> {custCpf}</div>
                                <div><strong className="text-stone-300">Endereço:</strong> {custStreet}, {custNumber} - {custNeighborhood}, {custComplement && `${custComplement} - `}{custCity}/{custState} - CEP: {custCep}</div>
                                <div><strong className="text-stone-300">Contato:</strong> {custPhone} | {custEmail}</div>
                              </div>
                            </div>

                            {/* Garantias de Envio adicionais de credibilidade */}
                            <div className="bg-stone-950 p-4 border border-white/10 rounded-xl space-y-2 text-[10px] text-stone-400">
                              <span className="text-[#C8A66A] uppercase font-black tracking-wider text-[9px] block">🛡️ Segurança e Garantias Quality:</span>
                              <div className="space-y-1.5">
                                <div>✓ <strong>Compromisso de Entrega</strong>: Caso ocorra alguma avaria no transporte, realizamos o reenvio de outra peça sem custos adicionais.</div>
                                <div>✓ <strong>Estampa de Alta Fusão</strong>: Processo térmico cozido que não desbota na lava-louças.</div>
                              </div>
                            </div>

                          </div>

                        </div>

                        {/* Botão de Retorno no final da Página */}
                        <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-3">
                          <button
                            onClick={() => {
                              setActiveCheckoutLink(null);
                              setActiveCheckoutName(null);
                              setActiveCheckoutImage(null);
                              setCheckoutStep(1);
                              setIsOrderPlaced(false);
                              setOrderBumpSelected(false);
                              setUpsellAccepted(false);
                            }}
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white text-xs rounded-xl font-bold transition-colors cursor-pointer border border-white/10"
                          >
                            Voltar para o Catálogo da Quality
                          </button>
                        </div>

                      </div>
                     ) : (
                       /* ========================================================== */
                       /* PASSO A PASSO ATIVO DO FORMULÁRIO DE CHECKOUT TRANSPARENTE */
                       /* ========================================================== */
                       <div className="space-y-6 text-stone-900 w-full animate-fadeIn">
                         
                         {/* ⏳ TEMPO DE URGÊNCIA ESTILO KIWIFY */}
                         <div className="bg-[#e55050] text-white p-3.5 rounded-xl flex items-center justify-center gap-3.5 shadow-sm font-sans select-none animate-pulse">
                           <span className="text-base sm:text-lg">⏱️</span>
                           <span className="text-sm sm:text-base font-black tracking-wide uppercase">
                             {formatUrgencyTime(urgencyTimeLeft)}
                           </span>
                           <span className="text-xs sm:text-sm font-extrabold uppercase border-l border-white/30 pl-3.5 tracking-wider">
                             Oferta por tempo limitado
                           </span>
                         </div>

                         {/* 📢 ESPAÇO DO BANNER COM IMAGEM DE QUALIDADE (EDITÁVEL) */}
                         <div className="w-full relative rounded-xl overflow-hidden shadow-sm border border-slate-200 group bg-slate-100">
                           <img
                             src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&h=400&q=80"
                             alt="Banner Promocional Quality"
                             className="w-full h-auto max-h-[160px] md:max-h-[220px] object-cover transition-all duration-300 group-hover:scale-[1.01]"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-left">
                             <span className="bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded w-fit mb-1.5 leading-none shadow-sm select-none">
                               ESPAÇO RESERVADO PARA SEU BANNER
                             </span>
                             <p className="text-white text-xs sm:text-sm font-bold tracking-tight select-none">
                               Sua Arte Personalizada nas Melhores Canecas do Brasil
                             </p>
                             <span className="text-[9px] text-slate-350 font-medium font-sans mt-1 select-none block leading-tight">
                               💡 Dica: altere na linha 4418 do arquivo App.tsx para colocar a imagem de seu banner personalizado!
                             </span>
                           </div>
                         </div>

                         {/* 🎁 BANNER PRINCIPAL COM FOTO DO PRODUTO (REQUISITO: QUADRADINHO DO PRODUTO AO LADO DO TÍTULO) */}
                         <div className="w-full bg-white p-4.5 sm:p-5 border border-slate-200 shadow-md rounded-xl flex items-center gap-4 text-left select-none relative overflow-hidden animate-fadeIn">
                           {/* Quadradinho menor/pequeno para foto do produto */}
                           <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 shrink-0 shadow-sm relative group">
                             <img
                               src={activeCheckoutImage || "https://i.postimg.cc/SR2X9crG/caneca-maezona-personalizada.jpg"}
                               alt={activeCheckoutName || "Caneca Selecionada"}
                               className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105"
                               referrerPolicy="no-referrer"
                             />
                           </div>

                           {/* Informações do Produto */}
                            <div className="flex-1 min-w-0">
                              <h2 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-tight whitespace-normal break-words leading-snug">
                                {activeCheckoutName || "Sua Caneca Premium Personalizada"}
                              </h2>
                            </div>


                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                           <div className="col-span-full md:col-span-7 space-y-6">
                           
                                                       {/* --- PASSO 1: IDENTIFICAÇÃO --- */}
                           {/* 🛒 RESUMO DETALHADO DO VALOR PARA CELULAR (REQUISITO DO USUÁRIO) */}
                           <div className="block md:hidden w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 shadow-sm animate-fadeIn text-left select-none space-y-2.5 mb-2">
                             <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                               <span className="text-xs font-black uppercase text-slate-750 tracking-wider flex items-center gap-1.5 font-sans">
                                 🛒 DETALHES DO SEU PEDIDO:
                               </span>
                               <span className="text-[10px] px-2 py-0.5 rounded bg-[#32bcad]/10 text-teal-800 border border-[#32bcad]/20 font-bold uppercase tracking-wider font-mono">
                                 Valor Detalhado
                               </span>
                             </div>

                             <div className="space-y-1.5 text-xs text-slate-600 font-sans">
                               {/* Item Principal */}
                               <div className="flex justify-between items-center font-bold">
                                 <span className="text-slate-700">{productQty}x Caneca {activeCheckoutName || "Personalizada (Quality)"}</span>
                                 <span className="text-slate-900 font-mono">R$ {(getProductPrice(activeCheckoutName) * productQty).toFixed(2).replace('.', ',')}</span>
                               </div>

                               {/* Order Bump - Porta Copo */}
                               {orderBumpSelected && (
                                 <div className="flex justify-between items-center text-rose-750 bg-rose-50 px-2 py-1 rounded border border-rose-500/15 animate-fadeIn">
                                   <span className="font-semibold flex items-center gap-1 text-rose-800"><span>✨</span> Porta-Copo Premium Quality</span>
                                   <span className="font-bold font-mono">R$ 12,90</span>
                                 </div>
                               )}

                               {/* Upsell - Segunda caneca */}
                               {upsellAccepted && (
                                 <div className="flex justify-between items-center text-emerald-750 bg-emerald-50 px-2 py-1 rounded border border-emerald-500/15 animate-fadeIn">
                                   <span className="font-semibold flex items-center gap-1 text-emerald-800"><span>☕</span> Segunda Caneca Quality (Promo)</span>
                                   <span className="font-bold font-mono">R$ 19,90</span>
                                 </div>
                               )}

                               {/* Frete */}
                               <div className="flex justify-between items-center font-semibold">
                                 <span className="text-slate-700">Entrega ({custSelectedShipping.toUpperCase()} Correios)</span>
                                 <span className="text-slate-900 font-bold font-mono">
                                   {shippingCost === 0 ? 'GRÁTIS' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                                 </span>
                               </div>

                               {/* Cupom de Desconto */}
                               {exitIntentDiscountApplied && (
                                 <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-250/80 animate-fadeIn font-mono">
                                   <span className="font-bold flex items-center gap-1 font-sans"><span>🎁</span> Cupom (10% OFF):</span>
                                   <span className="font-black text-emerald-700">
                                     - R$ {(((getProductPrice(activeCheckoutName) * productQty) + (orderBumpSelected ? 12.90 : 0) + (upsellAccepted ? 19.90 : 0)) * 0.1).toFixed(2).replace('.', ',')}
                                   </span>
                                 </div>
                               )}
                             </div>

                             {/* Total Faturado */}
                             <div className="flex justify-between items-center border-t border-slate-200/80 pt-2.5 mt-1 bg-amber-500/5 p-2 rounded-lg border-2 border-dashed border-amber-500/25">
                               <span className="font-extrabold uppercase text-[10px] tracking-wider text-amber-800">
                                 Total Faturado:
                               </span>
                               <span className="font-black text-sm text-amber-700 font-mono font-bold">
                                 R$ {finalAmountValue.toFixed(2).replace('.', ',')}
                               </span>
                             </div>
                           </div>

                           {true && (
                             <div className="space-y-4 p-3 xs:p-4.5 sm:p-6 bg-slate-50 border border-slate-200/80 rounded-xl animate-fadeIn text-left shadow-sm">
                               
                               <h3 className="text-sm sm:text-base font-sans font-black text-slate-800 uppercase tracking-wide border-l-2 border-amber-500 pl-3.5 select-none flex items-center justify-between flex-wrap gap-2">
                                 <span>1. Seus Dados de Faturamento</span>
                                 <span className="text-[10px] bg-emerald-500/10 text-emerald-700 font-mono px-2.5 py-1 rounded border border-emerald-500/20 uppercase font-bold tracking-wider shadow-sm">SSL Seguro</span>
                               </h3>

                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-xs sm:text-sm text-slate-600 font-bold uppercase tracking-wide block">
                                     Nome Completo *
                                   </label>
                                   <input
                                     type="text"
                                     value={custName}
                                     onChange={(e) => setCustName(e.target.value)}
                                     onBlur={() => {
                                       if (custName && custPhone) {
                                         captureLeadToServer('Iniciado');
                                       }
                                     }}
                                     placeholder="Digite seu nome completo"
                                     className={`w-full bg-slate-100 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all duration-300 font-sans shadow-sm ${
                                       showValidationChecked && !custName 
                                         ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                                         : 'border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10'
                                     }`}
                                   />
                                 </div>

                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-xs sm:text-sm text-slate-600 font-bold uppercase tracking-wide block">
                                     CPF/CNPJ *
                                   </label>
                                   <input
                                     type="text"
                                     value={custCpf}
                                     onChange={(e) => handleCpfChange(e.target.value)}
                                     placeholder="CPF ou CNPJ"
                                     className={`w-full bg-slate-100 border rounded-xl px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${
                                       showValidationChecked && custCpf.length < 14
                                         ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                                         : 'border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10'
                                     }`}
                                   />
                                 </div>

                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-xs sm:text-sm text-slate-600 font-bold uppercase tracking-wide block">
                                     Endereço de E-mail *
                                   </label>
                                   <input
                                     type="email"
                                     value={custEmail}
                                     onChange={(e) => setCustEmail(e.target.value)}
                                     onBlur={() => {
                                       if (custName && custPhone) {
                                         captureLeadToServer('Iniciado');
                                       }
                                     }}
                                     placeholder="exemplo@gmail.com"
                                     className={`w-full bg-slate-100 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${
                                       showValidationChecked && !custEmail.includes('@')
                                         ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                                         : 'border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10'
                                     }`}
                                   />
                                 </div>

                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-xs sm:text-sm text-slate-600 font-bold uppercase tracking-wide block">
                                     Celular / WhatsApp *
                                   </label>
                                   <input
                                     type="text"
                                     value={custPhone}
                                     onChange={(e) => handlePhoneChange(e.target.value)}
                                     onBlur={() => {
                                       if (custName && custPhone) {
                                         captureLeadToServer('Iniciado');
                                       }
                                     }}
                                     placeholder="(00) 90000-0000"
                                     className={`w-full bg-slate-100 border rounded-xl px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${
                                       showValidationChecked && custPhone.length < 14
                                         ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                                         : 'border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10'
                                     }`}
                                   />
                                 </div>

                               </div>

                             </div>
                           )}

                                                           {/* Coleção de Métodos */}
                            {/* --- PASSO 2: OPÇÃO DE PAGAMENTO SEGURO --- */}
                            {true && (
                              <div className="space-y-4 p-3 xs:p-4.5 sm:p-6 bg-slate-50 border border-slate-200/80 rounded-xl text-left shadow-sm animate-fadeIn">
                                {/* FORMA DE PAGAMENTO SECÇÃO FLAT */}
                            
                                <h3 className="text-sm sm:text-base font-sans font-black text-slate-800 uppercase tracking-wide border-l-2 border-amber-500 pl-3.5 select-none flex items-center justify-between flex-wrap gap-2">
                                  <span>2. Opção de Pagamento Seguro</span>
                                  <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-700 font-mono border border-emerald-500/20 uppercase tracking-wider font-bold shadow-sm">
                                    SSL Seguro
                                  </span>
                                </h3>

                                {/* Coleção de Métodos */}
                                <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-3">

                                                                 <button
                                   type="button"
                                   onClick={() => setCustPaymentMethod('pix_pushin')}
                                   className={`py-2.5 px-3 sm:py-3.5 sm:px-2 rounded-xl border flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-2.5 sm:gap-1.5 transition-all duration-300 cursor-pointer select-none w-full ${
                                     custPaymentMethod === 'pix_pushin'
                                       ? 'bg-[#32bcad]/10 border-[#32bcad] text-teal-900 shadow-sm font-bold'
                                       : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50/50'
                                   }`}
                                 >
                                   <svg className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                     <path d="M41.7 12.5C46.3 7.9 53.7 7.9 58.3 12.5L87.5 41.7C92.1 46.3 92.1 53.7 87.5 58.3L58.3 87.5C53.7 92.1 46.3 92.1 41.7 87.5L12.5 58.3C7.9 53.7 7.9 46.3 12.5 41.7L41.7 12.5ZM47.2 26.4L26.4 47.2C24.8 48.8 24.8 51.3 26.4 52.8L47.2 73.6C48.8 75.2 51.3 75.2 52.8 73.6L73.6 52.8C75.2 51.3 75.2 48.8 73.6 47.2L52.8 26.4C51.3 24.8 48.8 24.8 47.2 26.4Z" fill="#32bcad" />
                                     <path d="M50 38.9L38.9 50L50 61.1L61.1 50L50 38.9Z" fill="#32bcad" />
                                   </svg>
                                   <span className="text-xs font-black uppercase tracking-wide text-left sm:text-center leading-none">Pix</span>
                                 </button>

                                                                 <button
                                   type="button"
                                   onClick={() => setCustPaymentMethod('card')}
                                   className={`py-2.5 px-3 sm:py-3.5 sm:px-2 rounded-xl border flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-2.5 sm:gap-1.5 transition-all duration-300 cursor-pointer select-none w-full ${
                                     custPaymentMethod === 'card'
                                       ? 'bg-amber-500/10 border-amber-400 text-amber-900 shadow-sm font-bold'
                                       : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50/50'
                                   }`}
                                 >
                                   <span className="text-lg sm:text-xl shrink-0">💳</span>
                                   <span className="text-xs font-black uppercase tracking-wide text-left sm:text-center leading-none">Cartão</span>
                                   <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded leading-none font-bold uppercase tracking-wider font-mono ml-auto sm:ml-0 shrink-0">
                                     ATÉ 12X
                                   </span>
                                 </button>

                                                                 <button
                                   type="button"
                                   onClick={() => setCustPaymentMethod('boleto')}
                                   className={`py-2.5 px-3 sm:py-3.5 sm:px-2 rounded-xl border flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-2.5 sm:gap-1.5 transition-all duration-300 cursor-pointer select-none w-full ${
                                     custPaymentMethod === 'boleto'
                                       ? 'bg-amber-500/10 border-amber-400 text-amber-900 shadow-sm font-bold'
                                       : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50/50'
                                   }`}
                                 >
                                   <span className="text-lg sm:text-xl shrink-0">📄</span>
                                   <span className="text-xs font-black uppercase tracking-wide text-left sm:text-center leading-none">Boleto</span>
                                 </button>


                              </div>

                              {/* Lógica condicional por gateway e método selecionado */}
                              {custPaymentMethod === 'pix_pushin' && (
                                <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl select-none animate-fadeIn">
                                  <span className="text-xs font-black text-amber-800 uppercase tracking-wide block font-sans">
                                    💡 PIX DIRETO SEGURO EM TEMPO REAL:
                                  </span>
                                  <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 leading-relaxed font-sans">
                                    O QR Code do Pix dinâmico será gerado automaticamente. A confirmação ocorre em até 3 segundos e ativa a liberação do seu pedido instantaneamente no nosso banco de dados.
                                  </p>
                                </div>
                              )}

                              {custPaymentMethod === 'card' && (
                                <div className="space-y-4 animate-fadeIn">
                                  
                                  {/* CARTÃO DE IMPRESSÃO VISUAL REALISTA */}
                                  <div className="w-full flex justify-center py-2 select-none">
                                    <div className="w-full max-w-[240px] xs:max-w-[280px] aspect-[1.586] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-xl border border-slate-300/40 p-3.5 xs:p-4.5 flex flex-col justify-between shadow-xl relative overflow-hidden shrink-0">
                                      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full filter blur-xl" />
                                      
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <span className="text-[6px] text-amber-400 font-black tracking-widest block font-mono">VISA SECURE PLATINUM</span>
                                          <span className="text-[8px] text-white font-extrabold uppercase mt-0.5 block font-mono tracking-wider">Quality Canecas</span>
                                        </div>
                                        <div className="w-8 h-4.5 rounded bg-white/5 border border-white/10 text-stone-200 font-bold flex items-center justify-center font-mono uppercase tracking-widest text-[6px]">
                                          PREMIUM
                                        </div>
                                      </div>

                                      {/* Chip */}
                                      <div className="w-6.5 h-4.5 rounded bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/30 mt-1 mb-1" />

                                      {/* Card Number */}
                                      <div className="text-xs font-mono tracking-widest font-black text-white leading-none my-1">
                                        {cardNumber || "•••• •••• •••• ••••"}
                                      </div>

                                      {/* Name / Expiry */}
                                      <div className="flex justify-between items-end">
                                        <div className="max-w-[70%] min-w-0">
                                          <span className="text-[5px] text-stone-300 block uppercase font-mono">Titular do Cartão</span>
                                          <span className="text-[8px] text-stone-100 font-extrabold font-mono uppercase truncate block">
                                            {cardHolder || "NOME IMPRESSO"}
                                          </span>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <span className="text-[5px] text-stone-300 block uppercase font-mono">EXP</span>
                                          <span className="text-[8px] text-amber-400 font-bold font-mono">
                                            {cardExpiry || "MM/AA"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3.5 bg-white p-4 rounded-xl border border-slate-200">
                                    <div className="col-span-2 flex flex-col gap-1.5">
                                      <label className="text-xs text-slate-600 font-extrabold uppercase tracking-wide text-left block">
                                        Nome Impresso no Cartão *
                                      </label>
                                      <input
                                        type="text"
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        placeholder="EX: JOSE SILVA SANTOS"
                                        className="w-full bg-slate-100 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-4 py-3 text-sm uppercase text-slate-900 focus:outline-none transition-all duration-300 placeholder-slate-400 shadow-sm font-semibold"
                                      />
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-1.5">
                                      <label className="text-xs text-slate-600 font-extrabold uppercase tracking-wide text-left block">
                                        Número Completo do Cartão *
                                      </label>
                                      <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => handleCardNumberChange(e.target.value)}
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full bg-slate-100 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 focus:outline-none transition-all duration-300 placeholder-slate-400 shadow-sm font-bold"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-xs text-slate-600 font-extrabold uppercase tracking-wide text-left block">
                                        Validade *
                                      </label>
                                      <input
                                        type="text"
                                        value={cardExpiry}
                                        onChange={(e) => handleCardExpiryChange(e.target.value)}
                                        placeholder="MM/AA"
                                        maxLength={5}
                                        className="w-full bg-slate-100 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 focus:outline-none transition-all duration-300 placeholder-slate-400 shadow-sm font-bold"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-xs text-slate-600 font-extrabold uppercase tracking-wide text-left block">
                                        Código de Segurança (CVV) *
                                      </label>
                                      <input
                                        type="password"
                                        value={cardCvv}
                                        onChange={(e) => handleCardCvvChange(e.target.value)}
                                        placeholder="123"
                                        maxLength={4}
                                        className="w-full bg-slate-100 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 focus:outline-none transition-all duration-300 placeholder-slate-400 shadow-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {custPaymentMethod === 'infinitepay' && (
                                <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl select-none animate-fadeIn text-justify">
                                  <span className="text-xs font-black text-amber-800 uppercase tracking-wide block font-sans">
                                    ⭐ PORTAL OFICIAL INTEGRADO INFINITEPAY:
                                  </span>
                                  <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 leading-relaxed font-sans">
                                    Seus dados de faturamento e entrega serão pré-gravados de forma segura e você será redirecionado ao ambiente de pagamento oficial criptografado da InfinitePay para concluir sua transação com segurança jurídica absoluta.
                                  </p>
                                </div>
                              )}

                              {custPaymentMethod === 'boleto' && (
                                <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl select-none text-justify">
                                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed font-sans">
                                    Emissão segura e automática via API do Asaas. O prazo para compensação de boleto é de até 24h úteis. O PDF oficial será liberado no encerramento e também enviado para seu e-mail/WhatsApp.
                                  </p>
                                </div>
                              )}

                            

                          </div>
                        )}

                            {true && (
                          <div className="space-y-4 p-3 xs:p-4.5 sm:p-6 bg-slate-50 border border-slate-200/80 rounded-xl animate-fadeIn text-left shadow-sm">
                            
                            <h3 className="text-sm sm:text-base font-sans font-black text-slate-800 uppercase tracking-wide border-l-2 border-amber-500 pl-3.5 select-none flex items-center justify-between flex-wrap gap-2">
                              <span>3. Endereço e Entrega Correios</span>
                              <span className="text-[10px] bg-amber-500/10 text-amber-700 px-2.5 py-1 rounded border border-amber-500/20 font-mono text-center font-bold">Cálculo em Tempo Real</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                              
                              <div className="flex flex-col gap-1.5 sm:col-span-1 relative">
                                <label className="text-xs sm:text-sm text-slate-600 font-bold uppercase tracking-wide block">
                                  CEP de Entrega *
                                </label>
                                <input
                                  type="text"
                                  value={custCep}
                                  onChange={(e) => handleCepChange(e.target.value)}
                                  placeholder="00000-000"
                                  className={`w-full bg-slate-100 border rounded-xl px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${
                                    showValidationChecked && custCep!.replace(/\D/g, '').length !== 8
                                      ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                                      : 'border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10'
                                  }`}
                                />
                                {isCepLoading && (
                                  <span className="absolute right-3.5 bottom-3 text-xs text-amber-500 animate-spin">
                                    ⚙️
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-xs sm:text-sm text-slate-600 font-bold uppercase tracking-wide block">
                                  Rua / Logradouro *
                                </label>
                                <input
                                  type="text"
                                  value={custStreet}
                                  onChange={(e) => setCustStreet(e.target.value)}
                                  placeholder="Nome da avenida ou rua"
                                  className={`w-full bg-slate-100 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-405 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${
                                    showValidationChecked && !custStreet
                                      ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                                      : 'border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10'
                                  }`}
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs sm:text-sm text-slate-600 font-bold uppercase tracking-wide block">
                                  Número *
                                </label>
                                <input
                                  type="text"
                                  value={custNumber}
                                  onChange={(e) => setCustNumber(e.target.value)}
                                  placeholder="123"
                                  className={`w-full bg-slate-100 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-405 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${
                                    showValidationChecked && !custNumber
                                      ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                                      : 'border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10'
                                  }`}
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs sm:text-sm text-slate-600 font-bold uppercase tracking-wide block">
                                  Complemento
                                </label>
                                <input
                                  type="text"
                                  value={custComplement}
                                  onChange={(e) => setCustComplement(e.target.value)}
                                  placeholder="Apto, Bloco..."
                                  className="w-full bg-slate-100 border border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-405 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs sm:text-sm text-slate-600 font-bold uppercase tracking-wide block">
                                  Bairro *
                                </label>
                                <input
                                  type="text"
                                  value={custNeighborhood}
                                  onChange={(e) => setCustNeighborhood(e.target.value)}
                                  placeholder="Ex: Centro"
                                  className={`w-full bg-slate-100 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-405 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${
                                    showValidationChecked && !custNeighborhood
                                      ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                                      : 'border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10'
                                  }`}
                                />
                              </div>

                              <div className="flex flex-col gap-1.5 sm:col-span-3">
                                <label className="text-xs sm:text-sm text-slate-600 font-bold uppercase tracking-wide block">
                                  Cidade / Estado *
                                </label>
                                <div className="flex gap-2.5">
                                  <input
                                    type="text"
                                    value={custCity}
                                    onChange={(e) => setCustCity(e.target.value)}
                                    placeholder="Ex: São Paulo"
                                    className="flex-1 bg-slate-100 border border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm"
                                  />
                                  <input
                                    type="text"
                                    value={custState}
                                    onChange={(e) => setCustState(e.target.value)}
                                    placeholder="SP"
                                    className="w-16 bg-slate-100 border border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-4 py-3 text-sm text-slate-900 text-center uppercase focus:outline-none transition-all duration-300 shadow-sm font-mono"
                                  />
                                </div>
                              </div>

                            </div>

                            {/* Seletor Dinâmico de Frete (Simulação Melhor Envio) */}
                            {custCep.replace(/\D/g, '').length === 8 && (
                              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 space-y-3 select-none">
                                <span className="text-xs text-amber-800 font-extrabold uppercase tracking-wide block font-sans">
                                  📬 OPÇÕES DE ENVIO DISPONÍVEIS:
                                </span>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  
                                  <button
                                    onClick={() => setCustSelectedShipping('pac')}
                                    className={`p-3.5 rounded-xl border text-left flex gap-3 transition-all duration-300 cursor-pointer ${
                                      custSelectedShipping === 'pac'
                                        ? 'bg-amber-50 border-amber-400 shadow-sm'
                                        : 'bg-white border-slate-200 hover:border-amber-300'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      checked={custSelectedShipping === 'pac'}
                                      readOnly
                                      className="accent-amber-500 cursor-pointer mt-1"
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-sm font-black text-slate-800 uppercase tracking-wide">PAC Correios</span>
                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">Econômico</span>
                                      </div>
                                      <p className="text-xs text-slate-500 mt-1">Prazo de entrega: {shippingPacDays} dias úteis</p>
                                      <p className="text-sm font-black text-amber-600 mt-1 font-mono">
                                        {isFreteGratis ? (
                                          <span className="flex items-center gap-1.5 pr-1">
                                            <span className="line-through text-slate-400 text-xs font-normal">
                                              R$ {shippingPacPrice.toFixed(2).replace('.', ',')}
                                            </span>
                                            <span className="text-emerald-600 font-black text-xs bg-emerald-50 px-1 border border-emerald-200 rounded">GRÁTIS</span>
                                          </span>
                                        ) : (
                                          `R$ ${shippingPacPrice.toFixed(2).replace('.', ',')}`
                                        )}
                                      </p>
                                    </div>
                                  </button>

                                  <button
                                    onClick={() => setCustSelectedShipping('sedex')}
                                    className={`p-3.5 rounded-xl border text-left flex gap-3 transition-all duration-300 cursor-pointer ${
                                      custSelectedShipping === 'sedex'
                                        ? 'bg-amber-50 border-amber-400 shadow-sm'
                                        : 'bg-white border-slate-200 hover:border-amber-300'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      checked={custSelectedShipping === 'sedex'}
                                      readOnly
                                      className="accent-amber-500 cursor-pointer mt-1"
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-sm font-black text-slate-800 uppercase tracking-wide">SEDEX Expresso</span>
                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">Rápido</span>
                                      </div>
                                      <p className="text-xs text-slate-500 mt-1">Prazo de entrega: {shippingSedexDays} dias úteis</p>
                                      <p className="text-sm font-black text-emerald-600 mt-1 font-mono">
                                        {isFreteGratis ? (
                                          <span className="flex items-center gap-1.5 pr-1">
                                            <span className="line-through text-slate-400 text-xs font-normal">
                                              R$ {shippingSedexPrice.toFixed(2).replace('.', ',')}
                                            </span>
                                            <span className="text-emerald-600 font-black text-xs bg-emerald-50 px-1 border border-emerald-200 rounded">GRÁTIS</span>
                                          </span>
                                        ) : (
                                          `R$ ${shippingSedexPrice.toFixed(2).replace('.', ',')}`
                                        )}
                                      </p>
                                    </div>
                                  </button>

                                </div>
                              </div>
                            )}

                          </div>
                        )}

                                                        {/* --- PASSO 4: OFERTAS COMPLEMENTARES / BUMPS (DESIGN KIWIFY PREMIUM) --- */}
                            <div className="bg-slate-50 p-5 border border-slate-200/85 rounded-xl space-y-4 shadow-sm animate-fadeIn text-left md:hidden">
                              <h4 className="text-xs sm:text-sm font-sans font-black text-slate-800 uppercase tracking-widest block border-b border-slate-200 pb-2.5">
                                🎁 COMPLEMENTE SEU PEDIDO COM DESCONTOS EXCLUSIVOS:
                              </h4>

                              {/* ORDER BUMP - PORTA COPO */}
                              <div className="border-2 border-dashed border-sky-600/30 rounded-xl overflow-hidden bg-[#fafbfe] hover:border-sky-600/45 transition-all duration-300">
                                <div className="bg-[#ecf3fc] text-[#1e3e66] px-4 py-2.5 flex items-center gap-1.5 border-b border-dashed border-sky-600/20 font-sans font-black uppercase text-[10px] sm:text-xs tracking-wider select-none">
                                  <span>✨ SIM, EU ACEITO ESSA OFERTA ESPECIAL! (-50% OFF)</span>
                                </div>
                                <div className="p-3.5 sm:p-4 flex items-center gap-3.5 bg-white relative">
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xl text-rose-500 font-black animate-pulse select-none shrink-0">➜</span>
                                    <input
                                      type="checkbox"
                                      id="order-bump-silicone-flat"
                                      checked={orderBumpSelected}
                                      onChange={(e) => setOrderBumpSelected(e.target.checked)}
                                      className="w-5 h-5 accent-rose-600 rounded border-slate-300 bg-white focus:ring-rose-500/40 focus:ring-2 cursor-pointer transition-all duration-200 shrink-0"
                                    />
                                  </div>
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-150 overflow-hidden shrink-0 shadow-sm relative group select-none">
                                    <img
                                      src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=150&h=150&q=80"
                                      alt="Porta-Copo QUALITY"
                                      className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <label htmlFor="order-bump-silicone-flat" className="cursor-pointer block">
                                      <p className="text-slate-700 leading-normal text-xs sm:text-sm font-semibold">
                                        <span className="text-rose-600 font-black uppercase text-xs sm:text-sm tracking-wide block sm:inline mr-1.5">
                                          PORTA-COPO PREMIUM QUALITY:
                                        </span>
                                        Evite marcas e manchas de umidificação na sua mesa de trabalho! Combina 100% com o tema da sua caneca de forma elegante - apenas{" "}
                                        <strong className="text-rose-700 font-black font-sans text-xs sm:text-sm">R$ 12,90</strong> adicionais!
                                      </p>
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* UPSELL COMPLEMENTAR - SEGUNDA CANECA PELA METADE */}
                              <div className="border-2 border-dashed border-emerald-600/30 rounded-xl overflow-hidden bg-[#fafbfe] hover:border-emerald-600/45 transition-all duration-300">
                                <div className="bg-[#eefcf4] text-[#124d2d] px-4 py-2.5 flex items-center gap-1.5 border-b border-dashed border-emerald-600/20 font-sans font-black uppercase text-[10px] sm:text-xs tracking-wider select-none">
                                  <span>🎁 SIM, EU QUERO ESSE PRESENTE EXTRA! (50% DE DESCONTO)</span>
                                </div>
                                <div className="p-3.5 sm:p-4 flex items-center gap-3.5 bg-white relative">
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xl text-rose-500 font-black animate-pulse select-none shrink-0">➜</span>
                                    <input
                                      type="checkbox"
                                      id="upsell-flat-caneca"
                                      checked={upsellAccepted}
                                      onChange={(e) => setUpsellAccepted(e.target.checked)}
                                      className="w-5 h-5 accent-emerald-600 rounded border-slate-300 bg-white focus:ring-emerald-500/40 focus:ring-2 cursor-pointer transition-all duration-200 shrink-0"
                                    />
                                  </div>
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-150 overflow-hidden shrink-0 shadow-sm relative group select-none">
                                    <img
                                      src={activeCheckoutImage || "https://i.postimg.cc/SR2X9crG/caneca-maezona-personalizada.jpg"}
                                      alt="Segunda Caneca"
                                      className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <label htmlFor="upsell-flat-caneca" className="cursor-pointer block">
                                      <p className="text-slate-700 leading-normal text-xs sm:text-sm font-semibold">
                                        <span className="text-emerald-700 font-extrabold uppercase text-xs sm:text-sm tracking-wide block sm:inline mr-1.5">
                                          LEVAR SEGUNDA CANECA PELA METADE:
                                        </span>
                                        Aproveite a oportunidade única de presentear mais alguém na família com mais de 50% de Desconto Real! Garanta outra unidade idêntica por apenas{" "}
                                        <strong className="text-emerald-755 font-black font-sans text-xs sm:text-sm">R$ 19,90</strong> extras!
                                      </p>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>

                                                {/* COLUNA DIREITA: Resumo Exclusivo de Faturamento */}
                        <div className="col-span-full md:col-span-5 bg-white border border-slate-200 shadow-lg rounded-xl p-5 flex flex-col justify-between space-y-5 h-fit select-none shrink-0 sticky top-4">
                          
                          <div className="space-y-4 text-slate-800">
                            
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-left">
                              <h4 className="text-sm font-black uppercase tracking-wide text-slate-800 flex items-center gap-1.5 select-none">
                                <span className="text-sm">🗂️</span> Resumo do Pedido / Fatura
                              </h4>
                              <span className="text-xs text-slate-500 uppercase font-mono font-bold select-none">{productQty} {productQty > 1 ? 'itens' : 'item'}</span>
                            </div>

                            {/* Detalhes do Produto */}
                            {isCartActive ? (
                              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {cartItems.map((item: any, idx: number) => (
                                  <div key={`cart-item-dt-${idx}`} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-sm relative pr-6">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0 border">
                                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                      <h5 className="text-slate-850 text-xs font-black truncate uppercase tracking-tight">
                                        {item.title}
                                      </h5>
                                      {item.customText && <p className="text-[10px] text-slate-500 leading-none mt-0.5 truncate">✍️ "{item.customText}"</p>}
                                      {item.customPhotoName && <p className="text-[10px] text-emerald-600 leading-none mt-0.5 font-bold truncate">📸 {item.customPhotoName}</p>}
                                    </div>
                                    <div className="text-right shrink-0 font-mono text-[11px]">
                                      <span className="text-slate-500 text-[10px] block font-mono">Qtd: {item.qty}</span>
                                      <span className="text-slate-900 font-extrabold">R$ {((item.price || getProductPrice(item.title) || 45.90) * item.qty).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCartItems(prev => prev.filter((_, i) => i !== idx));
                                      }}
                                      className="absolute top-1/2 -translate-y-1/2 right-1.5 w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[9px] font-black flex items-center justify-center hover:bg-rose-500 hover:text-white cursor-pointer"
                                      title="Remover este item"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/30 shrink-0 text-amber-600 relative">
                                  <Coffee className="w-6 h-6 text-amber-500" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <h5 className="text-slate-850 text-sm font-black truncate uppercase tracking-wider leading-relaxed">
                                    {activeCheckoutName}
                                  </h5>
                                  <p className="text-amber-600 text-xs font-extrabold">Oficial Custom Quality</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-slate-500 text-xs block font-bold uppercase font-mono">Qtd: {productQty}</span>
                                  <span className="text-slate-900 text-sm font-black font-mono">R$ {baseMugsSubtotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                              </div>
                            )}

                            {/* Resumo Financeiro Atualizado */}
                            <div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs">
                              <div className="flex justify-between items-center text-slate-600 text-left text-xs sm:text-sm">
                                <span>Subtotal Canecas:</span>
                                <span className="font-extrabold text-slate-850 font-mono">R$ {baseMugsSubtotal.toFixed(2).replace('.', ',')}</span>
                              </div>
                              
                              {orderBumpSelected && (
                                <div className="flex justify-between items-center text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/80 animate-fadeIn font-mono text-xs sm:text-sm">
                                  <span className="flex items-center gap-1 text-xs text-slate-750 font-sans font-extrabold">
                                    <span>🪵</span> Porta-Copo Emborrachado:
                                  </span>
                                  <span className="font-extrabold text-amber-700">R$ 12,90</span>
                                </div>
                              )}

                              {upsellAccepted && (
                                <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/80 animate-fadeIn font-sans font-mono text-xs sm:text-sm">
                                  <span className="flex items-center gap-1 text-xs text-slate-750 font-extrabold">
                                    <span>☕</span> Segunda Caneca Quality:
                                  </span>
                                  <span className="font-extrabold text-emerald-700">R$ 19,90</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center text-slate-600 text-left text-xs sm:text-sm">
                                <span>Entrega ({custSelectedShipping.toUpperCase()} Correios):</span>
                                <span className="font-extrabold text-slate-850 font-mono">
                                  {shippingCost === 0 ? 'GRÁTIS' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                                </span>
                              </div>

                              {exitIntentDiscountApplied && (
                                <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/80 animate-fadeIn font-mono text-xs sm:text-sm">
                                  <span className="flex items-center gap-1 text-xs text-slate-750 font-sans font-extrabold">
                                    <span>🎁</span> Cupom RVXYRQH6S (10%):
                                  </span>
                                  <span className="font-extrabold text-emerald-700">
                                    - R$ {discountAmount.toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between items-center border-t border-slate-150 pt-3.5 text-slate-800 mt-2 bg-slate-50 p-3 rounded-xl border-2 border-dashed border-amber-500/30">
                                <span className="font-extrabold uppercase text-xs tracking-wider text-amber-700">
                                  Total Faturado:
                                </span>
                                <span className="font-black text-base sm:text-lg text-amber-750 font-mono scale-105 origin-right">
                                  R$ {finalAmountValue.toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            </div>

                          </div>

                          {/* --- PASSO 4: OFERTAS COMPLEMENTARES / BUMPS (DESIGN KIWIFY PREMIUM) - DESKTOP --- */}
                          <div className="bg-slate-50 p-4.5 border border-slate-200/85 rounded-xl space-y-4 shadow-sm animate-fadeIn text-left hidden md:block select-none">
                            <h4 className="text-xs sm:text-sm font-sans font-black text-slate-800 uppercase tracking-widest block border-b border-slate-200 pb-2.5">
                              🎁 COMPLEMENTE SEU PEDIDO COM DESCONTOS EXCLUSIVOS:
                            </h4>

                            {/* ORDER BUMP - PORTA COPO */}
                            <div className="border-2 border-dashed border-sky-600/30 rounded-xl overflow-hidden bg-[#fafbfe] hover:border-sky-600/45 transition-all duration-300">
                              <div className="bg-[#ecf3fc] text-[#1e3e66] px-4 py-2.5 flex items-center gap-1.5 border-b border-dashed border-sky-600/20 font-sans font-black uppercase text-[10px] tracking-wider select-none">
                                <span>✨ SIM, EU ACEITO ESSA OFERTA ESPECIAL! (-50% OFF)</span>
                              </div>
                              <div className="p-3 flex items-center gap-3 bg-white relative">
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-lg text-rose-500 font-sm block font-sans shrink-0">➜</span>
                                  <input
                                    type="checkbox"
                                    id="order-bump-silicone-flat-right"
                                    checked={orderBumpSelected}
                                    onChange={(e) => setOrderBumpSelected(e.target.checked)}
                                    className="w-4.5 h-4.5 accent-rose-600 rounded border-slate-300 bg-white focus:ring-rose-500/40 focus:ring-2 cursor-pointer transition-all duration-200 shrink-0"
                                  />
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-150 overflow-hidden shrink-0 shadow-sm relative group select-none">
                                  <img
                                    src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=150&h=150&q=80"
                                    alt="Porta-Copo QUALITY"
                                    className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <label htmlFor="order-bump-silicone-flat-right" className="cursor-pointer block">
                                    <p className="text-slate-700 leading-normal text-[11px] font-semibold">
                                      <span className="text-rose-600 font-black uppercase text-[11px] tracking-wide block">
                                        PORTA-COPO PREMIUM QUALITY:
                                      </span>
                                      Evite marcas e manchas! Combina 100% com a sua caneca - apenas{" "}
                                      <strong className="text-rose-700 font-black font-sans text-[11px]">R$ 12,90</strong>!
                                    </p>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* UPSELL COMPLEMENTAR - SEGUNDA CANECA PELA METADE */}
                            <div className="border-2 border-dashed border-emerald-600/30 rounded-xl overflow-hidden bg-[#fafbfe] hover:border-emerald-600/45 transition-all duration-300">
                              <div className="bg-[#eefcf4] text-[#124d2d] px-4 py-2.5 flex items-center gap-1.5 border-b border-dashed border-emerald-600/20 font-sans font-black uppercase text-[10px] tracking-wider select-none">
                                <span>🎁 SIM, EU QUERO ESSE PRESENTE EXTRA! (50% OFF)</span>
                              </div>
                              <div className="p-3 flex items-center gap-3 bg-white relative">
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-lg text-rose-500 font-sm block font-sans shrink-0">➜</span>
                                  <input
                                    type="checkbox"
                                    id="upsell-flat-caneca-right"
                                    checked={upsellAccepted}
                                    onChange={(e) => setUpsellAccepted(e.target.checked)}
                                    className="w-4.5 h-4.5 accent-emerald-600 rounded border-slate-300 bg-white focus:ring-emerald-500/40 focus:ring-2 cursor-pointer transition-all duration-200 shrink-0"
                                  />
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-150 overflow-hidden shrink-0 shadow-sm relative group select-none">
                                  <img
                                    src={activeCheckoutImage || "https://i.postimg.cc/SR2X9crG/caneca-maezona-personalizada.jpg"}
                                    alt="Segunda Caneca"
                                    className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <label htmlFor="upsell-flat-caneca-right" className="cursor-pointer block">
                                    <p className="text-slate-700 leading-normal text-[11px] font-semibold">
                                      <span className="text-emerald-700 font-extrabold uppercase text-[11px] tracking-wide block">
                                        LEVAR SEGUNDA CANECA PELA METADE:
                                      </span>
                                      Garanta outra unidade idêntica por apenas{" "}
                                      <strong className="text-emerald-755 font-black font-sans text-[11px]">R$ 19,90</strong> extras!
                                    </p>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>



                          {/* BOTÃO MASTER DO NOVO CHECKOUT UNIFICADO 2026 */}
                          <div className="pt-3 border-t border-slate-100 space-y-3">
                            <button
                              type="button"
                              disabled={isOrderLoading}
                              onClick={() => {
                                const cpfClean = custCpf.replace(/\D/g, '');
                                const phoneClean = custPhone.replace(/\D/g, '');
                                const cepClean = custCep ? custCep.replace(/\D/g, '') : '';

                                const isStep1Valid = custName.trim() !== '' && 
                                                     cpfClean.length >= 11 && 
                                                     custEmail.includes('@') && 
                                                     phoneClean.length >= 8;

                                const isStep2Valid = custStreet.trim() !== '' && 
                                                     custNumber.trim() !== '' && 
                                                     custNeighborhood.trim() !== '' && 
                                                     custCity.trim() !== '' && 
                                                     custState.trim() !== '' && 
                                                     cepClean.length === 8;

                                const isStep3Valid = (custPaymentMethod === 'card') 
                                  ? (cardHolder.trim() !== '' && cardNumber.replace(/\s/g, '').length >= 14 && cardExpiry.length === 5 && cardCvv.length >= 3) 
                                  : true;
                                
                                if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
                                  setShowValidationChecked(true);
                                  
                                  const missingHelp = [];
                                  if (!custName.trim()) missingHelp.push("Nome Completo");
                                  if (cpfClean.length < 11) missingHelp.push("CPF/CNPJ válido");
                                  if (!custEmail.includes('@')) missingHelp.push("E-mail válido");
                                  if (phoneClean.length < 8) missingHelp.push("Celular/WhatsApp");
                                  if (cepClean.length !== 8) missingHelp.push("CEP do Endereço");
                                  if (!custStreet.trim()) missingHelp.push("Rua/Logradouro");
                                  if (!custNumber.trim()) missingHelp.push("Número");
                                  if (!custNeighborhood.trim()) missingHelp.push("Bairro");
                                  if (!custCity.trim()) missingHelp.push("Cidade");
                                  if (!custState.trim()) missingHelp.push("Estado");
                                  
                                  if (custPaymentMethod === 'card') {
                                    if (!cardHolder.trim()) missingHelp.push("Titular do Cartão");
                                    if (cardNumber.replace(/\s/g, '').length < 14) missingHelp.push("Número do Cartão");
                                    if (cardExpiry.length !== 5) missingHelp.push("Validade (MM/AA)");
                                    if (cardCvv.length < 3) missingHelp.push("Código CVV");
                                  }

                                  if (missingHelp.length > 0) {
                                    setToastMessage(`Atenção: preencha ${missingHelp.slice(0, 3).join(', ')}${missingHelp.length > 3 ? '...' : ''}`);
                                  }
                                  return;
                                }

                                if (!upsellAccepted) {
                                  setShowUpsell(true);
                                } else {
                                  finalizeOrderPayment(upsellAccepted);
                                }
                              }}
                              className="w-full py-4.5 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 active:scale-[0.98] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_8px_24px_rgba(16,185,129,0.2)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              {isOrderLoading ? (
                                <span className="flex items-center gap-2">
                                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                                  <span>PROCESSANDO...</span>
                                </span>
                              ) : (
                                <>
                                  <ShieldCheck className="w-5 h-5 shrink-0 text-white" />
                                  <span>🛒 CONCLUIR COMPRA SEGURA</span>
                                </>
                              )}
                            </button>

                            {showValidationChecked && (
                              <p className="text-xs sm:text-sm text-rose-600 font-black text-center animate-pulse tracking-wide font-sans uppercase">
                                ⚠ COMPLETE TODOS OS CAMPOS MARCADOS PARA CONCLUIR O PEDIDO
                              </p>
                            )}

                            {/* Trust Badge Imgs */}
                            <div className="flex items-center justify-center gap-3 pt-2.5 border-t border-slate-100 select-none">
                              <span className="text-xs font-mono uppercase text-slate-500 tracking-wider">PAGAMENTO SEGURO SSL</span>
                              <span className="text-emerald-700 font-mono text-xs font-bold">100% CRIPTOGRAFADO PELA API</span>
                            </div>
                          </div>

                        </div>

                      </div>
                    </div>
                  )}

                  </div>

                </div>

              </div>
            {false && (
              /* ========================================================================= */
              /* MODO METICULOSAMENTE CONSERVADO: ATALHO VELOCIDADE POR LINK INFINITEPAY   */
              /* ========================================================================= */
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-stone-900">
                
                {/* Lado Esquerdo: Guia clássico de segurança */}
                <div className="lg:col-span-5 bg-stone-950 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-r border-white/5 space-y-8">
                  
                  <div>
                    {/* Selos de Credenciamento */}
                    <div className="flex items-center space-x-2.5 mb-6">
                      <div className="w-8 h-8 rounded-full border border-[#C8A66A] bg-stone-900 flex items-center justify-center">
                        <span className="text-[#C8A66A] font-black text-sm">Q</span>
                      </div>
                      <div>
                        <h4 className="font-sans font-black text-white text-[13px] uppercase tracking-wider leading-none">
                          Quality Canecas
                        </h4>
                        <p className="text-[10px] text-[#C8A66A] uppercase font-bold tracking-widest">
                          Checkout Blindado
                        </p>
                      </div>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-white uppercase leading-tight mb-2">
                      {activeCheckoutName || 'Caneca Personalizada'}
                    </h2>
                    <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-6">
                      Você abriu o faturamento clássico unificado da <strong className="text-white">Quality Canecas</strong>. Siga os passos ao lado para concluir sua compra com segurança total.
                    </p>

                    {/* Passos Ilustrados */}
                    <div className="space-y-4">
                      
                      <div className="flex gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          1
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configure o Pagamento</h4>
                          <p className="text-[11px] text-stone-300 leading-relaxed mt-0.5">
                            Selecione o pagamento por Pix (com aprovação instantânea) ou parcele no cartão em até 12x de forma criptografada.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cálculo de Frete Integrado</h4>
                          <p className="text-[11px] text-stone-300 leading-relaxed mt-0.5">
                            Basta inserir o seu CEP. A entrega será calculada e computada pela tecnologia do <strong className="text-white">Melhor Envio</strong> ativo na nossa conta!
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                          3
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Personalização via WhatsApp</h4>
                          <p className="text-[11px] text-stone-300 leading-relaxed mt-0.5">
                            Assim que o pagamento for concluído, nossa equipe de design entrará em contato via WhatsApp para receber a sua arte ou ideias e criar o modelo da sua caneca!
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Garantia Quality */}
                    <div className="mt-6 p-4 rounded-xl border border-white/5 bg-stone-900/40 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full filter blur-md" />
                      <div className="relative flex gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                            Garantia de Devolução 100%
                          </h5>
                          <p className="text-[10px] text-stone-300 leading-relaxed mt-0.5">
                            Se por qualquer motivo nossa equipe de criação não conseguir executar a sua personalização preferida, devolvemos 100% do valor da sua caneca na mesma hora. COMPRA TOTALMENTE GARANTIDA.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* ⚙️ Área do Lojista: Atalho Inteligente para gerenciar os links sem alterar código */}
                  <div className="border-t border-white/10 pt-4 mt-6">
                    {!isLojistaUnlocked ? (
                      <button
                        onClick={() => {
                          const pass = prompt("Digite a senha do painel para editar o link de pagamento do item '" + activeCheckoutName + "': (Senha padrão: quality)");
                          if (pass === 'quality') {
                            setIsLojistaUnlocked(true);
                            setTemporaryLinkLabel(activeCheckoutLink || '');
                          } else if (pass !== null) {
                            alert("Senha incorreta!");
                          }
                        }}
                        className="text-[10px] text-stone-500 hover:text-stone-300 transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <span>⚙️ Área Lojista: Configurar Link de Pagamento</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-stone-900 rounded-xl border border-[#C8A66A]/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#C8A66A] font-bold uppercase tracking-wider">
                            Alterar Link do Produto:
                          </span>
                          <button
                            onClick={() => setIsLojistaUnlocked(false)}
                            className="text-[9px] text-stone-400 hover:text-white"
                          >
                            Fechar
                          </button>
                        </div>
                        <p className="text-[9px] text-stone-300">
                          Insira abaixo o link de pagamento do produto gerado no aplicativo da InfinitePay:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={temporaryLinkLabel}
                            onChange={(e) => setTemporaryLinkLabel(e.target.value)}
                            placeholder="https://chk.infinitepay.io/..."
                            className="flex-1 bg-black border border-white/20 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#C8A66A]"
                          />
                          <button
                            onClick={() => {
                              if (activeCheckoutName) {
                                updatePayLink(activeCheckoutName, temporaryLinkLabel);
                                setActiveCheckoutLink(temporaryLinkLabel);
                                alert("Link de pagamento personalizado salvo!");
                                setIsLojistaUnlocked(false);
                              }
                            }}
                            className="bg-[#C8A66A] text-white text-[10px] font-bold px-3 py-1 rounded hover:bg-[#B8863B] transition-colors"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Lado Direito: Visual Capsulado de Checkout Ativo */}
                <div className="lg:col-span-7 bg-stone-900 flex flex-col items-center justify-center p-6 relative overflow-y-auto">
                  
                  {/* Visual Interativo de Confiança */}
                  <div className="max-w-md w-full bg-stone-950/85 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden z-10">
                    
                    {/* Halo decorativo de luz dourada */}
                    <div className="absolute -top-12 -left-12 w-40 h-40 bg-gradient-to-br from-[#C8A66A]/20 to-transparent rounded-full filter blur-xl" />
                    
                    {/* Selos Blindados */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8A66A] to-[#B8863B] flex items-center justify-center text-white shadow-xl mb-4 relative z-10">
                      <CreditCard className="w-8 h-8" />
                    </div>

                    <span className="text-[10px] font-bold text-[#E6C687] uppercase tracking-widest px-2.5 py-1 rounded bg-[#C8A66A]/10 border border-[#C8A66A]/20">
                      Sua Fatura Pronta
                    </span>

                    <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wide mt-3 mb-1">
                      Redirecionamento Protegido
                    </h3>
                    
                    <p className="text-stone-300 text-xs leading-relaxed max-w-xs mb-6">
                      A InfinitePay e o Melhor Envio impedem que o formulário de pagamento seja embutido diretamente devido às normas internacionais de segurança bancária PCI-DSS.
                    </p>

                    {activeCheckoutLink ? (
                      <div className="w-full space-y-3">
                        <a
                          href={activeCheckoutLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-4 px-6 bg-gradient-to-r from-[#C8A66A] to-[#B8863B] hover:brightness-110 text-stone-950 text-xs sm:text-sm font-black uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.015] active:scale-95 transition-all text-center"
                        >
                          CONCLUIR PAGAMENTO NA INFINITEPAY 💳
                        </a>
                        
                        <p className="text-[10px] text-stone-400">
                          O link abrirá em uma nova aba blindada oficial mantendo você seguro contra fraudes.
                        </p>
                      </div>
                    ) : (
                      <div className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                        <p className="text-xs text-amber-400 font-bold mb-2">
                          ⚠️ Nenhum Link de Faturamento Cadastrado Ainda!
                        </p>
                        <p className="text-[11px] text-stone-300 leading-relaxed mb-3">
                          Utilize a <strong>Área Lojista</strong> no canto inferior esquerdo para colar o link de pagamento criado no app da InfinitePay para o produto <strong>"{activeCheckoutName}"</strong>.
                        </p>
                        <button
                          onClick={() => {
                            handleWhatsAppRedirect({
                              type: 'Pedido Personalizado',
                              text: activeCheckoutName || 'Caneca Personalizada',
                              sub: 'Gostaria de solicitar o link do checkout para a comprar esta caneca.'
                            });
                            setActiveCheckoutLink(null);
                          }}
                          className="py-2.5 px-4 bg-[#25D366] hover:bg-[#128C7E] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 mx-auto transition-transform active:scale-95 shrink-0"
                        >
                          <span>Pedir no WhatsApp</span>
                        </button>
                      </div>
                    )}

                    {/* Selos de Segurança Adicionais */}
                    <div className="mt-8 pt-6 border-t border-white/10 w-full grid grid-cols-3 gap-2 col-span-3">
                      <div className="flex flex-col items-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
                        <span className="text-[8px] text-stone-400 font-semibold uppercase tracking-wider">
                          SSL 256 bits
                        </span>
                      </div>
                      <div className="flex flex-col items-center border-x border-white/10">
                        <Lock className="w-4 h-4 text-emerald-500 mb-1" />
                        <span className="text-[8px] text-stone-400 font-semibold uppercase tracking-wider">
                          PCI Compliant
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Truck className="w-4 h-4 text-emerald-500 mb-1" />
                        <span className="text-[8px] text-stone-400 font-semibold uppercase tracking-wider">
                          Melhor Envio
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Grafismo decorativo de fundo */}
                  <div className="absolute inset-0 bg-[#0c0c0c] select-none pointer-events-none opacity-30">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-stone-800 rounded-full border border-white/5 flex items-center justify-center">
                      <div className="w-[400px] h-[400px] bg-[#141414] rounded-full border border-white/5" />
                    </div>
                  </div>

                </div>

              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔮 MODAL DE FUNIL DE VENDAS: OFERTA DE UPSELL IMEDIATA */}
      <AnimatePresence>
        {showUpsell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[250] flex items-center justify-center p-4 animate-fadeIn"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="max-w-md w-full bg-[#0e0e0e] border border-[#C8A66A]/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Grafismo Estrelado de Oferta */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#C8A66A]/10 rounded-full filter blur-xl" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#C8A66A]/10 rounded-full filter blur-xl" />

              <div className="w-12 h-12 rounded-full bg-[#C8A66A]/15 text-[#C8A66A] flex items-center justify-center mx-auto mb-4 border border-[#C8A66A]/30 animate-pulse">
                <Gift className="w-6 h-6" />
              </div>

              <span className="text-[9px] sm:text-[10px] font-mono text-[#C8A66A] bg-[#C8A66A]/10 border border-[#C8A66A]/20 py-1 px-3 rounded-full uppercase tracking-widest font-bold">
                🔒 OFERTA ÚNICA DE UPSELL
              </span>

              <h2 className="text-xl sm:text-2xl font-black font-sans text-white uppercase tracking-tight mt-3 mb-2 leading-tight">
                Leve Outra Caneca por Apenas <span className="text-[#C8A66A]">R$ 19,90</span>!
              </h2>

              <p className="text-stone-300 text-xs leading-relaxed max-w-sm mx-auto mb-6">
                A maioria dos clientes compra canecas extras para presentear! Adicione uma <strong>Segunda Caneca Personalizada Idêntica</strong> com mais de <strong className="text-emerald-400 font-bold">55% OFF</strong> enviada no mesmo pacote!
              </p>

              <div className="bg-stone-900 border border-white/5 rounded-xl p-4 mb-6 flex items-center justify-between text-left">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-sans">Caneca Quality Extra</h4>
                  <p className="text-[10px] text-stone-400 mt-0.5">Envio no mesmo frete!</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] line-through text-stone-500 block">R$ {getProductPrice(activeCheckoutName).toFixed(2).replace('.', ',')}</span>
                  <span className="text-sm font-black text-[#C8A66A]">R$ 19,90</span>
                </div>
              </div>

              {/* Ações do Funil */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setUpsellAccepted(true);
                    setShowUpsell(false);
                    finalizeOrderPayment(true);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 active:scale-95 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-base text-stone-950 font-bold shrink-0">✓</span>
                  <span>SIM! DOBRAR MEU PEDIDO (-55% OFF)</span>
                </button>

                <button
                  onClick={() => {
                    setUpsellAccepted(false);
                    setShowUpsell(false);
                    finalizeOrderPayment(false);
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-stone-400 hover:text-stone-300 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer font-mono"
                >
                  Não, obrigado. Quero fechar apenas 1 caneca.
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎟️ POPUP DE SAÍDA (EXIT-INTENT): ÚLTIMA CHANCE */}
      <AnimatePresence>
        {showExitIntent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex justify-center items-center p-4 font-sans"
            id="exit-intent-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-md w-full bg-slate-900 border border-[#C8A66A]/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden"
              id="exit-intent-modal"
            >
              {/* Botão Fechar */}
              <button
                onClick={() => setShowExitIntent(false)}
                className="absolute top-3 right-3 text-stone-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/15 cursor-pointer transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Título Chamativo */}
              <h3 className="text-xl sm:text-2xl font-black text-rose-500 uppercase tracking-widest animate-pulse font-sans flex items-center justify-center gap-1.5 mb-2">
                <span>🔥</span> Última Chance!!!
              </h3>

              <p className="text-stone-300 text-xs sm:text-sm font-bold font-sans mb-6 text-center">
                Aproveite um cupom exclusivo para concluir seu pedido agora mesmo com desconto!
              </p>

              {/* Container Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-black/40 border border-white/5 p-4 rounded-xl mb-6">
                
                {/* Lado Esquerdo: Relógio Flip */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-2">A promoção expira em:</span>
                  <div className="flex items-center gap-1">
                    {/* Minutos Block */}
                    <div className="relative bg-rose-600 font-mono text-xl sm:text-2xl font-black text-white px-2.5 py-1 rounded shadow-md border-b-2 border-rose-850">
                      {Math.floor(exitIntentSecondsLeft / 60)}
                    </div>
                    <span className="text-white font-mono font-bold animate-pulse">:</span>
                    {/* Segundos Block */}
                    <div className="relative bg-rose-600 font-mono text-xl sm:text-2xl font-black text-white px-2.5 py-1 rounded shadow-md border-b-2 border-rose-850">
                      {(exitIntentSecondsLeft % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Cupom Copiador */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-2">Utilize o cupom:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("RVXYRQH6S");
                      setCopyFeedback(true);
                      setTimeout(() => setCopyFeedback(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8A66A]/10 border border-[#C8A66A]/40 text-[#E6C687] text-xs font-mono font-black uppercase rounded-lg hover:bg-[#C8A66A]/20 hover:border-[#C8A66A]/60 transition-all cursor-pointer relative"
                    title="Clique para copiar cupom"
                  >
                    <span>RVXYRQH6S</span>
                    {copyFeedback ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#E6C687]" />
                    )}
                  </button>
                  {copyFeedback && (
                    <span className="text-[9px] text-emerald-400 font-semibold animate-fadeIn mt-1 uppercase">Copiado com Sucesso!</span>
                  )}
                </div>

              </div>

              <p className="text-[10px] text-stone-500 font-medium mb-5">
                *Desconto de 10% válido por tempo limitado. Não cumulativo.
              </p>

              {/* Botão de Resgate de Alta Performance */}
              <button
                onClick={() => {
                  setExitIntentDiscountApplied(true);
                  setShowExitIntent(false);
                }}
                className="w-full py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-[0.98] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>Eu quero! 💳</span>
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧾 MODAL INTERATIVO: VISUALIZADOR DE BOLETO BANCÁRIO EMBUTIDO (BYPASS SANDBOX LOCKS) */}
      <AnimatePresence>
        {showEmbeddedBoletoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[500] flex justify-center items-center p-2 sm:p-4 font-sans"
            onClick={() => setShowEmbeddedBoletoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 15 }}
              className="max-w-2xl w-full bg-slate-50 rounded-2xl text-stone-900 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b border-white/5">
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider text-amber-400">🧾 Boleto Bancário Registrado</h3>
                  <p className="text-[10px] text-stone-400 leading-normal mt-0.5 font-medium">
                    Modo Seguro de Demonstração: Visualização direta sem login de testes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmbeddedBoletoModal(false)}
                  className="text-stone-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
                {/* Alerta explicativo */}
                <div className="bg-amber-500/10 border border-amber-500/20 text-stone-800 text-[11px] rounded-xl p-3 leading-relaxed">
                  <strong>ℹ️ Por que criamos esta tela?</strong> No ambiente de testes (Sandbox) do Asaas, as páginas externas oficiais exigem login e senha do seu painel administrativo para visualizar. Para sua melhor comodidade ao testar e aprovar o faturamento, nós criamos esta visualização direta e segura com os dados corretos gerados em tempo real!
                </div>

                {/* Bloco de Fatura do Boleto (Estilo Papel de Banco) */}
                <div className="bg-white border-2 border-stone-300 rounded-xl p-4 shadow-sm space-y-3 relative overflow-hidden select-text text-stone-800 text-[10px]">
                  {/* Linha topo: Banco */}
                  <div className="flex items-stretch border-b border-stone-800 divide-x divide-stone-800 h-10">
                    <div className="w-24 flex items-center justify-center font-black text-xs text-stone-900 pr-2 italic">
                      ASAAS BANCO
                    </div>
                    <div className="w-16 flex items-center justify-center font-bold text-xs text-stone-900 pl-2">
                      033-7
                    </div>
                    <div className="flex-1 flex items-center justify-end font-mono font-bold text-[10px] md:text-xs text-stone-905 px-2 tracking-tight overflow-x-auto whitespace-nowrap">
                      {paymentResponse?.boleto?.barCode || "34191.79001 01043.513184 91020.150008 7 981500000" + Math.floor((((getProductPrice(activeCheckoutName) * productQty) + (orderBumpSelected ? 12.90 : 0) + (upsellAccepted ? 19.90 : 0)) * (exitIntentDiscountApplied ? 0.9 : 1.0) + (custSelectedShipping === 'pac' ? shippingPacPrice : shippingSedexPrice)) * 100).toString().padStart(5, "0")}
                    </div>
                  </div>

                  {/* Informações primárias */}
                  <div className="grid grid-cols-4 border-b border-stone-800 divide-x divide-stone-800">
                    <div className="col-span-3 p-1">
                      <span className="block text-[8px] text-stone-500 uppercase font-black">Local de Pagamento</span>
                      <span className="font-bold text-stone-800">PAGÁVEL EM QUALQUER BANCO OU CASA LOTÉRICA ATÉ O VENCIMENTO</span>
                    </div>
                    <div className="p-1">
                      <span className="block text-[8px] text-stone-500 uppercase font-black">Vencimento</span>
                      <span className="font-bold text-stone-950 text-[10px] block text-right">
                        {(() => {
                          const tom = new Date();
                          tom.setDate(tom.getDate() + 1);
                          return tom.toLocaleDateString('pt-BR');
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Beneficiário e agência */}
                  <div className="grid grid-cols-4 border-b border-stone-800 divide-x divide-stone-800">
                    <div className="col-span-3 p-1">
                      <span className="block text-[8px] text-stone-500 uppercase font-black">Beneficiário</span>
                      <span className="font-black text-stone-900 uppercase">QUALITY CANECAS LTDA - CNPJ: 54.821.192/0001-20</span>
                    </div>
                    <div className="p-1">
                      <span className="block text-[8px] text-stone-500 uppercase font-black">Agência/Cód. Beneficiário</span>
                      <span className="font-bold text-stone-800 block text-right">0001 / 827364-1</span>
                    </div>
                  </div>

                  {/* Datas e espécie */}
                  <div className="grid grid-cols-5 border-b border-stone-800 divide-x divide-stone-800">
                    <div className="p-1 col-span-1">
                      <span className="block text-[8px] text-stone-500 uppercase font-black">Data do Doc.</span>
                      <span className="font-medium text-stone-800">{new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="p-1 col-span-2">
                      <span className="block text-[8px] text-stone-500 uppercase font-black">Nº do Documento</span>
                      <span className="font-bold text-stone-800 break-all">{paymentResponse?.paymentId || "PAY-MOCK542"}</span>
                    </div>
                    <div className="p-1 col-span-1">
                      <span className="block text-[8px] text-stone-500 uppercase font-black">Espécie Doc.</span>
                      <span className="font-medium text-stone-800 text-center block font-bold">DM</span>
                    </div>
                    <div className="p-1 col-span-1">
                      <span className="block text-[8px] text-stone-500 uppercase font-black">Aceite</span>
                      <span className="font-medium text-stone-800 text-center block font-mono font-bold">N</span>
                    </div>
                  </div>

                  {/* Informações de carteira e valor */}
                  <div className="grid grid-cols-4 border-b border-stone-800 divide-x divide-stone-800">
                    <div className="p-1 col-span-1">
                      <span className="block text-[8px] text-stone-500 uppercase font-black">Uso do Banco</span>
                      <span className="font-medium text-stone-800">SISTEMA APV</span>
                    </div>
                    <div className="p-1 col-span-1">
                      <span className="block text-[8px] text-stone-500 uppercase font-black">Carteira</span>
                      <span className="font-medium text-stone-800 text-center block font-bold">101</span>
                    </div>
                    <div className="p-1 col-span-1">
                      <span className="block text-[8px] text-stone-500 uppercase font-black">Quantidade</span>
                      <span className="font-medium text-stone-800 text-center block font-extrabold">{productQty}x</span>
                    </div>
                    <div className="p-1 col-span-1 bg-amber-500/5">
                      <span className="block text-[8px] text-stone-500 uppercase font-black font-extrabold">(=) Valor do Documento</span>
                      <span className="font-black text-stone-950 text-right block text-xs">
                        R$ {((((getProductPrice(activeCheckoutName) * productQty) + (orderBumpSelected ? 12.90 : 0) + (upsellAccepted ? 19.90 : 0)) * (exitIntentDiscountApplied ? 0.9 : 1.0) + (custSelectedShipping === 'pac' ? shippingPacPrice : shippingSedexPrice))).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Pagador */}
                  <div className="border border-stone-800 rounded-lg p-2 bg-stone-50 text-[9px] leading-relaxed">
                    <span className="block text-[8px] text-stone-500 uppercase font-black mb-1">Pagador (Sacado)</span>
                    <p className="font-black text-stone-900">👤 {custName || 'Cliente de Testes'} — CPF: {custCpf || '999.999.999-99'}</p>
                    <p className="text-stone-700 font-medium">📪 Endereço: {custStreet || 'Rua de Teste'}, {custNumber || '123'}{custComplement ? ` - ${custComplement}` : ''} - {custNeighborhood || 'Bairro Centro'}, {custCity || 'São Paulo'}/{custState || 'SP'} - CEP: {custCep || '01001-000'}</p>
                  </div>

                  {/* Barcode representation */}
                  <div className="pt-2">
                    <div className="text-center text-[7px] text-stone-500 font-mono tracking-widest uppercase mb-1">Ficha de Compensação — Autenticação Mecânica no Verso</div>
                    {/* Simulated visual strip */}
                    <div className="flex items-stretch h-14 bg-white justify-center py-1">
                      {[1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 1, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 1, 3, 2, 1, 4, 1, 2, 1, 4, 1, 2, 1, 2, 3, 1, 2, 1, 4, 1, 2, 1, 3, 2, 1].map((weight, i) => (
                        <div
                          key={`bar-${i}`}
                          className="h-full bg-black"
                          style={{ width: `${weight}px`, marginRight: '1px' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Copiar e ações adicionais */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const code = paymentResponse?.boleto?.barCode || "34191.79001 01043.513184 91020.150008 7 981500000" + Math.floor((((getProductPrice(activeCheckoutName) * productQty) + (orderBumpSelected ? 12.90 : 0) + (upsellAccepted ? 19.90 : 0)) * (exitIntentDiscountApplied ? 0.9 : 1.0) + (custSelectedShipping === 'pac' ? shippingPacPrice : shippingSedexPrice)) * 100).toString().padStart(5, "0");
                      navigator.clipboard.writeText(code);
                      setToastMessage("Código Copiado! Cole no seu banco. 📋");
                    }}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black tracking-wider text-xs rounded-xl uppercase transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer font-sans border-0 outline-none"
                  >
                    <span>📋 Copiar Linha Digitável</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmbeddedBoletoModal(false)}
                    className="py-3 px-6 bg-stone-200 hover:bg-stone-300 text-stone-700 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer font-sans"
                  >
                    Voltar pro Checkout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
