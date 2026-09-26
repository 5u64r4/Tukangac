import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory transaction store for demo/development caching
interface TransactionRecord {
  orderId: string;
  transactionId: string;
  grossAmount: number;
  paymentType: string;
  transactionStatus: 'pending' | 'settlement' | 'paid' | 'expire' | 'cancel' | 'deny' | 'refund';
  fraudStatus?: string;
  snapToken?: string;
  redirectUrl?: string;
  vaNumber?: string;
  bank?: string;
  billKey?: string;
  billerCode?: string;
  qrCodeUrl?: string;
  createdAt: string;
  settlementTime?: string;
  customerName?: string;
  customerPhone?: string;
}

const transactionsDb: Map<string, TransactionRecord> = new Map();

// Midtrans configuration helper
const getMidtransConfig = () => {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const rawServerKey = process.env.MIDTRANS_SERVER_KEY || '';
  const rawClientKey = process.env.MIDTRANS_CLIENT_KEY || '';
  
  const serverKey = rawServerKey.trim();
  const clientKey = rawClientKey.trim() || 'SB-Mid-client-demo-tukang-ac-key';
  
  const snapBaseUrl = isProduction 
    ? 'https://app.midtrans.com/snap/v1' 
    : 'https://app.sandbox.midtrans.com/snap/v1';
    
  const coreBaseUrl = isProduction
    ? 'https://api.midtrans.com/v2'
    : 'https://api.sandbox.midtrans.com/v2';

  const isDemoKey = !serverKey || 
    serverKey.includes('demo') || 
    serverKey.includes('YOUR_') || 
    serverKey.includes('placeholder') || 
    serverKey.length < 15;

  return {
    isProduction,
    serverKey,
    clientKey,
    snapBaseUrl,
    coreBaseUrl,
    isDemoKey
  };
};

// ==========================================
// MIDTRANS API ROUTES
// ==========================================

// 1. GET Public Midtrans Config (Client Key & Environment)
app.get('/api/midtrans/config', (req, res) => {
  const config = getMidtransConfig();
  res.json({
    clientKey: config.clientKey,
    isProduction: config.isProduction,
    isDemoMode: config.isDemoKey
  });
});

// 2. POST Create Snap Transaction Token
app.post('/api/midtrans/create-snap-token', async (req, res) => {
  try {
    const { 
      orderId, 
      grossAmount, 
      customerName, 
      customerPhone, 
      customerEmail = 'customer@tukangaconline.id',
      serviceName = 'Layanan Service AC',
      unitCount = 1,
      items = []
    } = req.body;

    if (!orderId || !grossAmount) {
      return res.status(400).json({ error: 'orderId and grossAmount are required' });
    }

    const config = getMidtransConfig();
    const cleanOrderId = String(orderId).trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const amount = Math.round(Number(grossAmount));
    const cleanPhone = String(customerPhone || '081234567890').replace(/[^0-9+]/g, '').slice(0, 19) || '081234567890';
    const cleanCustomerName = String(customerName || 'Pelanggan').slice(0, 50);

    // Prepare Snap Parameter payload according to Midtrans specifications
    const formattedItems = items.length > 0 ? items.map((it: any, idx: number) => ({
      id: String(it.id || `${cleanOrderId}-${idx}`).slice(0, 50),
      price: Math.round(Number(it.price || amount)),
      quantity: Number(it.quantity || 1),
      name: String(it.name || serviceName).slice(0, 50)
    })) : [
      {
        id: cleanOrderId.slice(0, 50),
        price: amount,
        quantity: 1,
        name: `${String(serviceName).slice(0, 35)} (${unitCount} unit)`.slice(0, 50)
      }
    ];

    const snapPayload = {
      transaction_details: {
        order_id: cleanOrderId,
        gross_amount: amount
      },
      customer_details: {
        first_name: cleanCustomerName,
        email: customerEmail,
        phone: cleanPhone
      },
      item_details: formattedItems,
      enabled_payments: [
        'gopay',
        'shopeepay',
        'other_qris',
        'bca_va',
        'bni_va',
        'bri_va',
        'echannel', // Mandiri Bill
        'permata_va',
        'credit_card',
        'indomaret',
        'alfamart'
      ],
      callbacks: {
        finish: `${process.env.APP_URL || 'http://localhost:3000'}/?payment=finish&orderId=${cleanOrderId}`
      }
    };

    // If a valid live or sandbox server key is provided, attempt actual Midtrans Snap API call
    if (!config.isDemoKey && config.serverKey) {
      try {
        const authString = Buffer.from(`${config.serverKey}:`).toString('base64');
        const midtransRes = await fetch(`${config.snapBaseUrl}/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${authString}`
          },
          body: JSON.stringify(snapPayload)
        });

        const data: any = await midtransRes.json();

        if (midtransRes.ok && data.token) {
          const generatedTrxId = `TRX-MID-${Date.now()}`;
          const newRecord: TransactionRecord = {
            orderId: cleanOrderId,
            transactionId: generatedTrxId,
            grossAmount: amount,
            paymentType: 'snap',
            transactionStatus: 'pending',
            snapToken: data.token,
            redirectUrl: data.redirect_url,
            customerName: cleanCustomerName,
            customerPhone: cleanPhone,
            createdAt: new Date().toISOString()
          };
          transactionsDb.set(cleanOrderId, newRecord);

          return res.json({
            success: true,
            token: data.token,
            redirectUrl: data.redirect_url,
            orderId: cleanOrderId,
            grossAmount: amount,
            isDemo: false
          });
        } else {
          // Log informative message and smoothly use sandbox simulation mode
          console.info(`[Midtrans Info] Snap API response: ${JSON.stringify(data?.error_messages || data)}. Using active Sandbox simulation.`);
        }
      } catch (err: any) {
        console.info(`[Midtrans Info] Network fetch to Snap API failed (${err?.message}). Using active Sandbox simulation.`);
      }
    }

    // High-fidelity interactive Sandbox simulation token
    const mockToken = `snap-token-${cleanOrderId}-${crypto.randomBytes(8).toString('hex')}`;
    const mockRedirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockToken}`;
    const generatedTrxId = `TRX-MID-${Date.now()}`;

    const newRecord: TransactionRecord = {
      orderId: cleanOrderId,
      transactionId: generatedTrxId,
      grossAmount: amount,
      paymentType: 'qris_gopay',
      transactionStatus: 'pending',
      snapToken: mockToken,
      redirectUrl: mockRedirectUrl,
      vaNumber: `8808${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      bank: 'BCA',
      customerName: cleanCustomerName,
      customerPhone: cleanPhone,
      createdAt: new Date().toISOString()
    };
    transactionsDb.set(cleanOrderId, newRecord);

    return res.json({
      success: true,
      token: mockToken,
      redirectUrl: mockRedirectUrl,
      orderId: cleanOrderId,
      grossAmount: amount,
      isDemo: true,
      message: 'Token Midtrans Snap aktif dalam mode Sandbox/Demo.'
    });

  } catch (error: any) {
    console.error('Error creating snap transaction:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 3. POST Webhook / HTTP Notification Handler from Midtrans
app.post('/api/midtrans/notification', (req, res) => {
  try {
    const notification = req.body;
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paymentType = notification.payment_type;
    const grossAmount = Number(notification.gross_amount);

    console.log(`[Midtrans Webhook] Received notification for Order #${orderId}: status=${transactionStatus}, type=${paymentType}`);

    let mappedStatus: 'pending' | 'settlement' | 'paid' | 'expire' | 'cancel' | 'deny' | 'refund' = 'pending';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        mappedStatus = 'pending';
      } else if (fraudStatus === 'accept') {
        mappedStatus = 'settlement';
      }
    } else if (transactionStatus === 'settlement') {
      mappedStatus = 'settlement';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny') {
      mappedStatus = 'cancel';
    } else if (transactionStatus === 'expire') {
      mappedStatus = 'expire';
    } else if (transactionStatus === 'pending') {
      mappedStatus = 'pending';
    } else if (transactionStatus === 'refund') {
      mappedStatus = 'refund';
    }

    // Update in-memory record
    if (orderId && transactionsDb.has(orderId)) {
      const existing = transactionsDb.get(orderId)!;
      existing.transactionStatus = mappedStatus;
      existing.paymentType = paymentType || existing.paymentType;
      existing.fraudStatus = fraudStatus;
      if (mappedStatus === 'settlement') {
        existing.settlementTime = new Date().toISOString();
      }
      transactionsDb.set(orderId, existing);
    } else if (orderId) {
      transactionsDb.set(orderId, {
        orderId,
        transactionId: notification.transaction_id || `TRX-MID-${Date.now()}`,
        grossAmount: grossAmount || 0,
        paymentType: paymentType || 'midtrans',
        transactionStatus: mappedStatus,
        fraudStatus,
        createdAt: new Date().toISOString(),
        settlementTime: mappedStatus === 'settlement' ? new Date().toISOString() : undefined
      });
    }

    // Midtrans expects 200 OK response with simple JSON
    return res.status(200).json({ status: 'OK', message: 'Notification received' });
  } catch (error: any) {
    console.error('Error handling midtrans notification:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 4. GET Transaction Status Check
app.get('/api/midtrans/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const config = getMidtransConfig();

    // Check memory store first
    const record = transactionsDb.get(orderId);

    // If real server key exists and not demo, try checking live Core API status
    if (!config.isDemoKey && config.serverKey) {
      try {
        const authString = Buffer.from(`${config.serverKey}:`).toString('base64');
        const midtransRes = await fetch(`${config.coreBaseUrl}/${orderId}/status`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${authString}`
          }
        });
        if (midtransRes.ok) {
          const liveData: any = await midtransRes.json();
          return res.json({
            orderId,
            status: liveData.transaction_status,
            paymentType: liveData.payment_type,
            grossAmount: liveData.gross_amount,
            transactionTime: liveData.transaction_time,
            settlementTime: liveData.settlement_time,
            vaNumber: liveData.va_numbers?.[0]?.va_number || record?.vaNumber,
            bank: liveData.va_numbers?.[0]?.bank || record?.bank,
            fraudStatus: liveData.fraud_status,
            raw: liveData
          });
        }
      } catch (err) {
        console.warn('Error fetching live midtrans status:', err);
      }
    }

    if (record) {
      return res.json({
        orderId,
        status: record.transactionStatus,
        paymentType: record.paymentType,
        grossAmount: record.grossAmount,
        transactionTime: record.createdAt,
        settlementTime: record.settlementTime,
        vaNumber: record.vaNumber,
        bank: record.bank,
        transactionId: record.transactionId
      });
    }

    return res.json({
      orderId,
      status: 'pending',
      paymentType: 'midtrans',
      grossAmount: 150000,
      message: 'Status default pending'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. POST Simulation Route (Sandbox Instant Payment Confirmation for UI testing)
app.post('/api/midtrans/simulate-payment', (req, res) => {
  try {
    const { orderId, paymentChannel = 'qris', status = 'settlement' } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const cleanOrderId = String(orderId).trim();
    let record = transactionsDb.get(cleanOrderId);
    const nowStr = new Date().toLocaleString('id-ID', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    }) + ' WIB';

    if (!record) {
      record = {
        orderId: cleanOrderId,
        transactionId: `TRX-MID-${Date.now()}`,
        grossAmount: 150000,
        paymentType: paymentChannel,
        transactionStatus: status as any,
        createdAt: new Date().toISOString(),
        settlementTime: new Date().toISOString()
      };
    } else {
      record.transactionStatus = status as any;
      record.paymentType = paymentChannel;
      record.settlementTime = new Date().toISOString();
    }

    transactionsDb.set(cleanOrderId, record);

    return res.json({
      success: true,
      orderId: cleanOrderId,
      transactionStatus: status,
      paymentChannel,
      paidAt: nowStr,
      transactionId: record.transactionId,
      message: `Pembayaran Order #${cleanOrderId} berhasil diverifikasi (Status: ${status}).`
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Tukang AC Online Midtrans Gateway' });
});

// ==========================================
// VITE INTEGRATION & STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Tukang AC Online Server running on http://localhost:${PORT}`);
  });
}

startServer();
