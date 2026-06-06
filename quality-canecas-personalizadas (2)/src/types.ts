/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import canecaImperialPremium from './assets/images/caneca_imperial_premium_1779561807763.png';

export interface ThemeCollection {
  id: string;
  name: string;
  description: string;
  iconName: string; // Dynamic icon reference from lucide-react
  accentColor?: string;
}

export interface SpecialDate {
  id: string;
  title: string;
  description: string;
  tagline: string;
  bgImage: string;
  accent: string;
}

export interface MugProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  isPremium?: boolean;
  priceEstimate?: string;
  badge?: string;
  features: string[];
}

export interface UserReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
}

// 20 Themes requested by user
export const THEME_COLLECTIONS: ThemeCollection[] = [
  { id: 'cafe', name: 'Café', description: 'Para despertar a criatividade a cada gole.', iconName: 'Coffee' },
  { id: 'musica', name: 'Música', description: 'O ritmo do seu dia em forma de caneca.', iconName: 'Music' },
  { id: 'filmes', name: 'Filmes', description: 'Cenas marcantes da telona com você.', iconName: 'Film' },
  { id: 'series', name: 'Séries', description: 'Sua maratona favorita na hora do chá.', iconName: 'Tv' },
  { id: 'frases', name: 'Frases', description: 'Palavras que inspiram suas manhãs.', iconName: 'Quote' },
  { id: 'motivacional', name: 'Motivacional', description: 'Dose diária de ânimo e energia positiva.', iconName: 'TrendingUp' },
  { id: 'geek', name: 'Geek', description: 'Universo de heróis, ficção e tecnologia.', iconName: 'Compass' },
  { id: 'games', name: 'Games', description: 'Suba de nível no seu café da manhã.', iconName: 'Gamepad2' },
  { id: 'animes', name: 'Animes', description: 'A energia dos animes no seu lar.', iconName: 'Sparkles' },
  { id: 'familia', name: 'Família', description: 'Lembranças afetivas para quem você ama.', iconName: 'Users' },
  { id: 'amor', name: 'Amor', description: 'O presente perfeito para o seu par ideal.', iconName: 'Heart' },
  { id: 'profissoes', name: 'Profissões', description: 'Orgulho da sua carreira em destaque.', iconName: 'Briefcase' },
  { id: 'carros', name: 'Carros', description: 'A paixão por motores estampada.', iconName: 'Car' },
  { id: 'futebol', name: 'Futebol', description: 'Torça pelo seu time do coração com estilo.', iconName: 'Trophy' },
  { id: 'signos', name: 'Signos', description: 'A caneca perfeita para a sua personalidade astral.', iconName: 'Moon' },
  { id: 'pet', name: 'Pet', description: 'O amor pelo seu pet sempre por perto.', iconName: 'Dog' },
  { id: 'flores', name: 'Flores', description: 'Delicadeza e frescor na sua caneca floral.', iconName: 'Flower' },
  { id: 'religioso', name: 'Religioso', description: 'Mensagens de fé, paz e devoção diária.', iconName: 'Star' },
  { id: 'datas-comemorativas', name: 'Datas comemorativas', description: 'Presentes memoráveis para aniversários e datas.', iconName: 'Gift' },
  { id: 'personalizadas-foto', name: 'Personalizadas com foto', description: 'Eternize seus retratos favoritos em alta definição.', iconName: 'Camera' },
];

// Special dates
export const SPECIAL_DATES: SpecialDate[] = [
  {
    id: 'dia-das-maes',
    title: 'Dia das Mães',
    description: 'Caneca personalizada Dia das Mães com foto e frase de afeto.',
    tagline: 'Eternize o amor mais puro com canecas personalizadas para o Dia das Mães. Uma das opções de presentes personalizados mais buscadas para emocionar quem você ama, com impressão de alta definição e estampas exclusivas de altíssima durabilidade.',
    bgImage: 'https://i.postimg.cc/htx5VfZN/dia-das-maes-caneca-personalizada-quality.jpg',
    accent: 'from-pink-50 to-rose-100',
  },
  {
    id: 'dia-dos-namorados',
    title: 'Dia dos Namorados',
    description: 'Presentes de casal criativos com canecas de namorados personalizadas.',
    tagline: 'Surpreenda no Dia dos Namorados com canecas de porcelana de casal personalizadas que se completam ou trazem fotos românticas de momentos marcantes. Celebre o amor com um presente de casal exclusivo e incomparável.',
    bgImage: 'https://i.postimg.cc/6QczhRVs/dia-dos-namorados-canecas-personalizadas-quality.jpg',
    accent: 'from-rose-50 to-red-100',
  },
  {
    id: 'dia-dos-pais',
    title: 'Dia dos Pais',
    description: 'Caneca personalizada para o Dia dos Pais - Homenagem e fotos.',
    tagline: 'Homenageie seu herói com canecas personalizadas para o Dia dos Pais. Designs clássicos, modernos e artes exclusivas com fotos da família ou frases emocionantes que expressam gratidão e amor com acabamento premium.',
    bgImage: 'https://i.postimg.cc/QMdYw0dt/dia-dos-pais-canecas-personalizadas-quality.jpg',
    accent: 'from-blue-50 to-indigo-100',
  },
  {
    id: 'copa-do-mundo',
    title: 'Copa do Mundo',
    description: 'Caneca de futebol da Copa do Mundo personalizada com nome e número.',
    tagline: 'Torça pela seleção com estilo! Canecas personalizadas da Copa do Mundo com seu nome, número e o design da escalação ou do seu time preferido. Perfeitas para colecionar, decorar ou presentear fanáticos por esportes.',
    bgImage: 'https://i.postimg.cc/NjBDX51p/copa-do-mundo-canecas-quality.jpg',
    accent: 'from-green-50 to-emerald-100',
  },
  {
    id: 'natal',
    title: 'Natal',
    description: 'Lembranças natalinas afetivas e canecas corporativas de fim de ano.',
    tagline: 'Celebre a magia das festas de fim de ano com canecas de Natal personalizadas. Perfeitas para presentes de amigo secreto, lembranças de final de ano familiares ou como brindes corporativos sofisticados para colaboradores e clientes.',
    bgImage: 'https://i.postimg.cc/2y74zN0n/natal-canecas-personalizadas-quality.png',
    accent: 'from-amber-50 to-yellow-100',
  },
  {
    id: 'ano-novo',
    title: 'Ano Novo & Réveillon',
    description: 'Caneca personalizada Ano Novo com data, ano, tema festivo e metas.',
    tagline: 'Celebre e brinde à virada! Nossas canecas temáticas de Ano Novo vêm personalizadas com o ano atual da virada, data especial, metas motivacionais e designs festivos requintados em dourado metálico para começar o ano com energia brilhante.',
    bgImage: 'https://i.postimg.cc/XJyL6hS6/ano-novo-canecas-personalizadas-quality.png',
    accent: 'from-orange-50 to-amber-100',
  }
];

// User reviews
export const USER_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    name: 'Carolina Santos',
    location: 'São Paulo - SP',
    rating: 5,
    comment: 'A qualidade ficou incrível. Superou minha expectativa. O detalhe dourado brilha perfeitamente e é super resistente!',
    date: 'Há 2 dias',
  },
  {
    id: 'rev-2',
    name: 'Carlos Henrique',
    location: 'Rio de Janeiro - RJ',
    rating: 5,
    comment: 'Chegou perfeito e muito bem embalado. Comprei a imperial personalizada para presentear minha sócia e ela ficou maravilhada.',
    date: 'Há 1 semana',
  },
  {
    id: 'rev-3',
    name: 'Mariana Azevedo',
    location: 'Belo Horizonte - MG',
    rating: 5,
    comment: 'Presenteei e foi sucesso total. O atendimento no WhatsApp foi super atencioso, me ajudaram a ajustar a imagem.',
    date: 'Há 2 semanas',
  },
  {
    id: 'rev-4',
    name: 'Ricardo Souza',
    location: 'Curitiba - PR',
    rating: 5,
    comment: 'Acabamento impecável e atendimento excelente. É nítido o cuidado em cada detalhe, desde o design até o envio.',
    date: 'Há 3 semanas',
  }
];

export const MUG_PRODUCTS: MugProduct[] = [
  {
    id: 'caneca- imperial',
    name: 'Caneca Imperial Premium',
    description: 'Elegância, sofisticação e acabamento diferenciado para uma personalização exclusiva.',
    image: canecaImperialPremium,
    isPremium: true,
    badge: 'Premium',
    priceEstimate: 'Sob Consulta',
    features: ['Acabamento Dourado Metálico no Aro e Alça', 'Porcelana Branca de Alta Densidade', 'Impressão de Altíssima Resolução', 'Embalagem Luxuosa Inclusa']
  },
  {
    id: 'caneca-branca',
    name: 'Caneca Branca Clássica',
    description: 'A caneca perfeita para o dia a dia. Porcelana brilhante que valoriza qualquer arte.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
    priceEstimate: 'A partir de R$ 34,90',
    features: ['Cerâmica de Excelente Durabilidade', 'Segura para Micro-ondas', 'Brilho Intenso de Longo Prazo', 'Área Total de Impressão']
  },
  {
    id: 'caneca-preta',
    name: 'Caneca Preta Minimalista',
    description: 'Sóbria, elegante e moderna. O fundo escuro traz destaque absoluto a logos e artes coloridas.',
    image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0c6b?auto=format&fit=crop&q=80&w=600',
    priceEstimate: 'A partir de R$ 39,90',
    features: ['Acabamento Preto Satinado ou Brilhoso', 'Visual Moderno e Sofisticado', 'Realce Extremo de Cores Claras', 'Material Resistente']
  },
  {
    id: 'caneca-alca-coracao',
    name: 'Caneca Alça Coração',
    description: 'Um toque extra de carinho. A alça em formato de coração confere romance e amor ao presente.',
    image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=600',
    priceEstimate: 'A partir de R$ 42,90',
    features: ['Alça Temática Especial', 'Interior e Alça Coloridos Opcionais', 'Ideal para Datas Românticas', 'Resistente a Lavagens']
  },
  {
    id: 'caneca-colher',
    name: 'Caneca com Colher',
    description: 'Praticidade com muito charme. Acompanha uma colher personalizada que se encaixa perfeitamente na alça.',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=600',
    priceEstimate: 'A partir de R$ 44,90',
    features: ['Suporte Integrado para a Colher', 'Acompanha Caneca e Colher Coordinadas', 'Excelente para Sobremesas e Caldos', 'Aparência Super Delicada']
  },
  {
    id: 'caneca-magica',
    name: 'Caneca Mágica',
    description: 'Surpresa a cada dose. A arte é revelada magicamente ao adicionar qualquer bebida quente.',
    image: 'https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&q=80&w=600',
    priceEstimate: 'A partir de R$ 49,90',
    features: ['Efeito Termocrômico Revelador', 'Película Sólida Preta com Mudança Rápida', 'Excelente Conversação e Presente Dinâmico', 'Sensível à Temperatura']
  },
  {
    id: 'caneca-chope',
    name: 'Caneca de Chope',
    description: 'Robusta e requintada. Copo de vidro jateado grosso ideal para confraternizações e comemorações.',
    image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&q=80&w=600',
    priceEstimate: 'A partir de R$ 49,90',
    features: ['Vidro Jateado de Alta Espessura', 'Capacidade Expandida para Bebidas', 'Uso Ideal para Happy Hour ou Eventos', 'Efeito Canelado ou Liso']
  }
];

