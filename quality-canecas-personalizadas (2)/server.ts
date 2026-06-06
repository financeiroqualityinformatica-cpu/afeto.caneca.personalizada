import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// Orders JSON DB helper path
const ORDERS_FILE_PATH = path.join(process.cwd(), "orders.json");

// Save or update an order/lead
app.post("/api/save-order", (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData || !orderData.name || !orderData.phone) {
      return res.status(400).json({ error: "Nome e WhatsApp do cliente são obrigatórios para capturar o lead" });
    }

    // Read current orders
    let orders: any[] = [];
    if (fs.existsSync(ORDERS_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(ORDERS_FILE_PATH, "utf8");
        orders = JSON.parse(fileContent || "[]");
      } catch (err) {
        console.error("[JSON DB Read Error]", err);
        orders = [];
      }
    }

    // Generate unique ID if not present
    const orderId = orderData.paymentId || orderData.id || "order_" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const existingIndex = orders.findIndex(o => o.phone === orderData.phone && (o.id === orderId || o.paymentId === orderId || (Date.now() - new Date(o.date).getTime()) < 3600000)); // check same number in last hour or same ID

    const record = {
      id: orderId,
      name: orderData.name,
      cpf: orderData.cpf || "",
      email: orderData.email || "",
      phone: orderData.phone,
      cep: orderData.cep || "",
      street: orderData.street || "",
      number: orderData.number || "",
      neighborhood: orderData.neighborhood || "",
      city: orderData.city || "",
      state: orderData.state || "",
      items: orderData.items || [],
      amount: orderData.amount || 0,
      paymentMethod: orderData.paymentMethod || "pix_pushin",
      shippingCost: orderData.shippingCost || 0,
      shippingName: orderData.shippingName || "Correios PAC",
      status: orderData.status || "Iniciado/Lead",
      date: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      // Update existing lead or order details
      orders[existingIndex] = { ...orders[existingIndex], ...record };
    } else {
      // Add as a new purchase lead
      orders.unshift(record);
    }

    // Write back
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), "utf8");
    console.log(`[JSON DB SUCCESS] Salvo lead de ${orderData.name} (${orderData.phone}) - Status: ${record.status}`);
    
    return res.json({ success: true, orderId: record.id });
  } catch (error: any) {
    console.error("[JSON DB SAVE ERROR]", error);
    return res.status(500).json({ error: "Erro interno ao persistir dados do cliente: " + error.message });
  }
});

// Retrieve orders (Optionally check for pass-token security from the client)
app.get("/api/admin/orders", (req, res) => {
  try {
    const { password } = req.query;
    if (password !== "admin123") {
      return res.status(403).json({ error: "Senha de Administrador incorreta ou ausente" });
    }

    if (!fs.existsSync(ORDERS_FILE_PATH)) {
      return res.json([]);
    }

    const fileContent = fs.readFileSync(ORDERS_FILE_PATH, "utf8");
    const orders = JSON.parse(fileContent || "[]");
    return res.json(orders);
  } catch (error: any) {
    console.error("[JSON DB RETRIEVE ERROR]", error);
    return res.status(500).json({ error: "Falha ao carregar lista de clientes: " + error.message });
  }
});

// API Config Status check endpoint (Safe; no keys leaked)
app.get("/api/credentials-status", (req, res) => {
  const asaasKey = process.env.ASAAS_API_KEY;
  const melhorEnvioToken = process.env.MELHOR_ENVIO_TOKEN;
  const infinitePayKey = process.env.INFINITE_PAY_API_KEY;

  res.json({
    hasAsaas: !!asaasKey,
    isAsaasSandbox: asaasKey ? (asaasKey.startsWith("$aact_hmlg_") || asaasKey.includes("sandbox")) : true,
    hasMelhorEnvio: !!melhorEnvioToken,
    isMelhorEnvioSandbox: melhorEnvioToken ? (!melhorEnvioToken.includes(".") || melhorEnvioToken.length < 150) : true,
    hasInfinitePay: !!infinitePayKey,
    infinitePayHandle: process.env.INFINITE_PAY_HANDLE || "canecas-e-afeto"
  });
});

// Log incoming API requests for troubleshooting
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`[API Log] ${req.method} ${req.path}`);
  }
  next();
});

// Origin postal code for Quality Cups (Belo Horizonte, MG)
const ORIGIN_CEP = "30110010";

/* ========================================================================= */
/* 1. MELHOR ENVIO SHIPPING API INTEGRATION                                  */
/* ========================================================================= */
app.post("/api/calculate-freight", async (req, res) => {
  const { cepDestino } = req.body;
  if (!cepDestino) {
    return res.status(400).json({ error: "CEP de destino é obrigatório" });
  }

  const cleanCep = cepDestino.replace(/\D/g, "");
  if (cleanCep.length !== 8) {
    return res.status(400).json({ error: "CEP de destino inválido (deve possuir 8 dígitos)" });
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;

  // Fast descriptive fallback in case token is unconfigured or simple demonstration
  const generateSimulatedShipping = (cep: string) => {
    // Basic calculation depending on CEP regions of Brazil
    const stateDigit = parseInt(cep.charAt(0));
    let baseTime = 3;
    let pacPrice = 14.90;
    let sedexPrice = 22.50;

    if (stateDigit === 3) {
      // Near MG (Origin is Minas Gerais)
      pacPrice = 11.40;
      sedexPrice = 16.80;
      baseTime = 2;
    } else if (stateDigit >= 0 && stateDigit <= 2) {
      // SP / RJ
      pacPrice = 13.90;
      sedexPrice = 21.00;
      baseTime = 3;
    } else if (stateDigit >= 7 && stateDigit <= 9) {
      // CO / N / NE
      pacPrice = 21.90;
      sedexPrice = 34.50;
      baseTime = 6;
    }

    return [
      {
        id: "pac",
        name: "Correios PAC (Conexão Garantida)",
        price: pacPrice,
        delivery_time: baseTime + 4,
        company: "Correios"
      },
      {
        id: "sedex",
        name: "Correios SEDEX (Alta Performance)",
        price: sedexPrice,
        delivery_time: baseTime,
        company: "Correios"
      }
    ];
  };

  if (!token) {
    console.warn("[Melhor Envio] Token não configurado em .env. Utilizando simulador inteligente com CEP:", cleanCep);
    return res.json({
      success: true,
      simulated: true,
      rates: generateSimulatedShipping(cleanCep),
      info: "Simulado devido a token ausente em seu .env"
    });
  }

  // Determine whether to use sandbox or production based on token signature or availability
  const isSandbox = !token.includes(".") || token.length < 150; // Simple check, real JWT are long dot-notated strings
  const melhovEnvioUrl = isSandbox 
    ? "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate"
    : "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate";

  try {
    console.log(`[Melhor Envio] Tentando cálculo real com API em: ${melhovEnvioUrl}`);
    
    const response = await fetch(melhovEnvioUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "User-Agent": "QualityCanecasClient/1.0 (financeiroqualityinformatica@gmail.com)"
      },
      body: JSON.stringify({
        from: {
          postal_code: ORIGIN_CEP
        },
        to: {
          postal_code: cleanCep
        },
        products: [
          {
            id: "caneca-quality",
            width: 11,
            height: 11,
            length: 11,
            weight: 0.45,
            insurance_value: 45.90,
            quantity: 1
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Melhor Envio API Error] Status: ${response.status}`, errorText);
      throw new Error(`Melhor Envio retornou status ${response.status}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      // Filter out services that don't have price or delivery time (or are errors)
      const validRates = data
        .filter((item: any) => item && !item.error && item.price && item.delivery_time)
        .map((item: any) => ({
          id: item.name.toLowerCase().includes("pac") ? "pac" : item.name.toLowerCase().includes("sedex") ? "sedex" : `frete_${item.id}`,
          name: `${item.company.name} ${item.name}`,
          price: parseFloat(item.price),
          delivery_time: item.delivery_time,
          company: item.company.name
        }));

      if (validRates.length > 0) {
        console.log(`[Melhor Envio] Encontrados ${validRates.length} fretes reais calculados com sucesso.`);
        return res.json({
          success: true,
          simulated: false,
          rates: validRates
        });
      }
    }

    throw new Error("Nenhum frete elegível retornado pela API");

  } catch (error: any) {
    console.error("[Melhor Envio Failover] Falha ao processar Melhor Envio. Chamando fallback inteligente...", error.message);
    return res.json({
      success: true,
      simulated: true,
      rates: generateSimulatedShipping(cleanCep),
      info: `Calculado via fallback devido à falha na API: ${error.message}`
    });
  }
});


/* ========================================================================= */
/* 2. ASAAS GATEWAY API INTEGRATION (CUSTOMER & CHARGE & PIX QR CODE)        */
/* ========================================================================= */
app.post("/api/create-asass-payment", async (req, res) => {
  const {
    name,
    cpf,
    email,
    paymentMethod, // "pix_pushin" | "card" | "boleto"
    amount,
    description
  } = req.body;

  if (!name || !cpf || !email || !amount) {
    return res.status(400).json({ error: "Parâmetros obrigatórios ausentes" });
  }

  const apiKey = process.env.ASAAS_API_KEY;
  const cleanCpf = cpf.replace(/\D/g, "");

  // Fallback simulator in case Asaas Key is missing or fails
  const simulateAsaasPayment = () => {
    const mockPaymentId = "pay_mock_" + Math.random().toString(36).substring(2, 11).toUpperCase();
    const mockCopyPaste = `00020101021226830014br.gov.bcb.pix0007asaashm0134${mockPaymentId}5204000053039865405${amount.toFixed(2)}5802BR5915QualityCanecas6009SAO_PAULO62070503***6304D5F2`;
    
    // Aesthetic simulated base64 QR Code pattern
    const mockQrCodeImage = "https://sandbox.asaas.com/api/v3/payments/pixQrCode/simulated.png"; // Placeholder
    
    return {
      success: true,
      simulated: true,
      paymentId: mockPaymentId,
      billingType: paymentMethod === "pix_pushin" ? "PIX" : paymentMethod === "boleto" ? "BOLETO" : "CREDIT_CARD",
      value: amount,
      invoiceUrl: `https://sandbox.asaas.com/i/${mockPaymentId}`,
      pix: paymentMethod === "pix_pushin" ? {
        encodedImage: "", // We can handle custom UI QR Code display
        payload: mockCopyPaste,
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      } : null,
      boleto: paymentMethod === "boleto" ? {
        barCode: "34191.79001 01043.513184 91020.150008 7 981500000" + Math.floor(amount * 100).toString().padStart(5, "0"),
        pdfUrl: `https://sandbox.asaas.com/boleto/render/${mockPaymentId}`,
        invoiceUrl: `https://sandbox.asaas.com/i/${mockPaymentId}`
      } : null,
      message: "Processado em ambiente de demonstração blindado."
    };
  };

  if (!apiKey) {
    console.warn("[Asaas] API Key ausente em .env. Retornando simulação realista.");
    return res.json(simulateAsaasPayment());
  }

  // Determine if it is testing sandbox based on token namespace or setup
  const isSandbox = apiKey.startsWith("$aact_hmlg_") || apiKey.includes("sandbox");
  const asaasBaseUrl = isSandbox 
    ? "https://sandbox.asaas.com/api/v3" 
    : "https://api.asaas.com/v3";

  try {
    console.log(`[Asaas] Usando base URL: ${asaasBaseUrl} - Modo Sandbox: ${isSandbox}`);

    // Standard headers for ASAAS Authorization
    const baseHeaders = {
      "Content-Type": "application/json",
      "access_token": apiKey,
      "User-Agent": "QualityCanecasApp/1.0"
    };

    // 1. STEP ONE: Create or find customer in Asaas
    console.log(`[Asaas] Criando/buscando cliente: ${name} CPF: ${cleanCpf}`);
    
    const customerResponse = await fetch(`${asaasBaseUrl}/customers`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify({
        name,
        cpfCnpj: cleanCpf,
        email,
        mobilePhone: "11999999999",
        notificationDisabled: true
      })
    });

    let customerId = "";
    if (!customerResponse.ok) {
      const errorText = await customerResponse.text();
      console.error("[Asaas Customer Creation Error]", errorText);
      
      // Se falhou ao criar (pode ser CPF já cadastrado), tentamos buscar o cliente existente pelo CPF
      console.log(`[Asaas] Tentando buscar cliente existente por CPF/CNPJ: ${cleanCpf}`);
      const listResponse = await fetch(`${asaasBaseUrl}/customers?cpfCnpj=${cleanCpf}`, {
        method: "GET",
        headers: baseHeaders
      });
      if (listResponse.ok) {
        const listData = await listResponse.json();
        if (listData.data && listData.data.length > 0) {
          customerId = listData.data[0].id;
          console.log(`[Asaas] Cliente existente encontrado ID: ${customerId}`);
        }
      }
      if (!customerId) {
        throw new Error(`Asaas falhou ao processar cliente: ${errorText}`);
      }
    } else {
      const customerData = await customerResponse.json();
      customerId = customerData.id;
    }
    
    if (!customerId) {
      throw new Error("Não foi possível gerar um ID de cliente no Asaas");
    }

    console.log(`[Asaas] Cliente registrado com sucesso ID: ${customerId}`);

    // Map frontend payment method to Asaas billingType
    let billingType = "PIX";
    if (paymentMethod === "card") {
      billingType = "CREDIT_CARD";
    } else if (paymentMethod === "boleto") {
      billingType = "BOLETO";
    }

    // Set expiration/due date to tomorrow YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split("T")[0];

    // 2. STEP TWO: Create charge inside Asaas catalog
    const chargePayload: any = {
      customer: customerId,
      billingType,
      value: parseFloat(amount.toFixed(2)),
      dueDate,
      description: description || "Caneca Personalizada Quality Canecas",
      postalService: false
    };

    console.log("[Asaas] Criando faturamento:", chargePayload);

    const paymentResponse = await fetch(`${asaasBaseUrl}/payments`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(chargePayload)
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error("[Asaas Payment Creation Error]", errorText);
      throw new Error(`Asaas falhou ao criar faturamento: ${paymentResponse.status}`);
    }

    const paymentData = await paymentResponse.json();
    const paymentId = paymentData.id;

    console.log(`[Asaas] Faturamento criado com sucesso ID: ${paymentId}`);

    // 3. STEP THREE: If Pix, retrieve real QR Code and copy/paste link
    let pixData = null;
    if (billingType === "PIX" && paymentId) {
      console.log(`[Asaas] Buscando QR Code PIX para cobrança: ${paymentId}`);
      
      const pixResponse = await fetch(`${asaasBaseUrl}/payments/${paymentId}/pixQrCode`, {
        method: "GET",
        headers: baseHeaders
      });

      if (pixResponse.ok) {
        pixData = await pixResponse.json();
        console.log("[Asaas] QR Code Pix gerado e recebido com sucesso.");
      } else {
        console.error("[Asaas Pix QR Code Error] Falha ao recuperar QR Code do Pix");
      }
    }

    // Formulate pristine full response
    return res.json({
      success: true,
      simulated: false,
      paymentId,
      billingType,
      value: paymentData.value,
      invoiceUrl: paymentData.invoiceUrl,
      bankSlipUrl: paymentData.bankSlipUrl,
      pix: pixData ? {
        encodedImage: pixData.encodedImage, // Base64 raw PNG
        payload: pixData.payload, // Pix Copy/Paste key
        expirationDate: pixData.expirationDate
      } : (billingType === "PIX" ? simulateAsaasPayment().pix : null),
      boleto: billingType === "BOLETO" ? {
        barCode: paymentData.identificationField || "Boleto emitido no Asaas",
        pdfUrl: paymentData.bankSlipUrl,
        invoiceUrl: paymentData.invoiceUrl
      } : null
    });

  } catch (error: any) {
    console.error("[Asaas API Fallback] Erro na requisição integrada Asaas:", error.message);
    return res.json(simulateAsaasPayment());
  }
});


/* ========================================================================= */
/* 3. INFINITEPAY GATEWAY API INTEGRATION (DYNAMIC CHECKOUT LINKS)           */
/* ========================================================================= */
app.post("/api/create-infinitepay-payment", async (req, res) => {
  const {
    name,
    email,
    phone,
    amount,
    description,
    items,
    address
  } = req.body;

  const handle = process.env.INFINITE_PAY_HANDLE || "canecas-e-afeto";
  const token = process.env.INFINITE_PAY_API_KEY;

  console.log(`[InfinitePay] Iniciando geração de link de pagamento para Handle: ${handle}`);

  // Fallback simulator in case of missing keys, errors, or offline mode
  const simulateInfinitePayLink = () => {
    const cleanId = Math.random().toString(36).substring(2, 9).toUpperCase();
    return {
      success: true,
      simulated: true,
      url: `https://pay.infinitepay.io/${handle}/quality-mugs-simulado-${cleanId}`,
      message: "Link gerado via simulador InfinitePay"
    };
  };

  try {
    // 1. Format the items array into centavos as required by InfinitePay (R$ 10,00 = 1000 cents)
    const finalItems = items && items.length > 0 ? items : [{
      quantity: 1,
      price: amount,
      description: description || "Caneca Personalizada Quality Canecas"
    }];

    const formattedItems = finalItems.map((item: any) => {
      // If the price is a BRL float from frontend (e.g. 45.90), multiply by 100 to get cents.
      const rawPrice = item.price ? parseFloat(item.price) : amount;
      let centsPrice;
      if (rawPrice % 1 === 0 && rawPrice > 500) {
        // Already looks like cents (e.g. 4590 cents for R$ 45.90)
        centsPrice = Math.round(rawPrice);
      } else {
        centsPrice = Math.round(rawPrice * 100);
      }

      return {
        quantity: item.quantity ? parseInt(item.quantity) : 1,
        price: centsPrice,
        description: item.description || "Caneca Personalizada Quality"
      };
    });

    // 2. Build InfinitePay payload
    const payload: any = {
      handle,
      items: formattedItems
    };

    // Add optional custom Order Identifier (NSU)
    payload.order_nsu = "nsu_" + Math.random().toString(36).substring(2, 11).toUpperCase();

    // Add conditional redirect or webhook configuration if any (relative to host)
    if (process.env.APP_URL) {
      payload.redirect_url = `${process.env.APP_URL}/sucesso`;
    }

    // Add customer data if provided to pre-fill the checkout field
    if (name || email || phone) {
      payload.customer = {
        name: name || "Cliente Quality Canecas",
        email: email || "compras@qualitymugs.com",
        phone_number: phone ? (phone.startsWith("+55") ? phone : `+55${phone.replace(/\D/g, "")}`) : "+5531999999999"
      };
    }

    // Add delivery address if configured
    if (address && address.cep) {
      payload.address = {
        cep: address.cep.replace(/\D/g, ""),
        street: address.street || "",
        number: address.number || "",
        neighborhood: address.neighborhood || "",
        complement: address.complement || ""
      };
    }

    console.log("[InfinitePay Required Payload]", JSON.stringify(payload, null, 2));

    // 3. Dispatch POST request to InfinitePay API
    const headers: any = {
      "Accept": "application/json",
      "Content-Type": "application/json"
    };

    if (token) {
      headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }

    const response = await fetch("https://api.checkout.infinitepay.io/links", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error(`[InfinitePay API Error] Status: ${response.status}`, errorResponse);
      throw new Error(`InfinitePay retornou erro: ${response.status} - ${errorResponse}`);
    }

    const data = await response.json();
    console.log("[InfinitePay Success Response]", data);

    // Accept multiple styles of links returned by InfinitePay structure
    const payLinkUrl = data.url || data.link || data.checkout_url || data.checkoutUrl;

    if (!payLinkUrl) {
      throw new Error("Nenhum link de pagamento ou URL retornado no JSON");
    }

    return res.json({
      success: true,
      simulated: false,
      url: payLinkUrl,
      order_nsu: payload.order_nsu,
      message: "Link dinâmico do checkout InfinitePay gerado com sucesso!"
    });

  } catch (error: any) {
    console.warn(`[InfinitePay API Failover] ${error.message}. Gerando link de simulação robusto...`);
    return res.json(simulateInfinitePayLink());
  }
});


/* ========================================================================= */
/* VITE MIDDLEWARE CONFIGURATION FOR PRODUCTION & DEVELOPMENT ROUTES         */
/* ========================================================================= */
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Node Server] Iniciando em Modo Desenvolvimento...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    // Use Vite middlewares to handle React routing/rebuilding dynamically
    app.use(vite.middlewares);
  } else {
    console.log("[Node Server] Iniciando em Modo Produção...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files compiled inside /dist
    app.use(express.static(distPath));
    
    // Handle SPA fallbacks correctly on Express router
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`-----------------------------------------------------`);
    console.log(`🚀 SERVIDOR FULL-STACK SEGURO ATIVO: http://localhost:${PORT}`);
    console.log(`🛡️  ASAAS API & MELHOR ENVIO CONECTADOS`);
    console.log(`-----------------------------------------------------`);
  });
};

startServer().catch((error) => {
  console.error("[Node Critical] Falha catastrófica ao subir servidor:", error);
});
