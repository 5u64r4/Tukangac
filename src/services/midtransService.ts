import { Order, PaymentChannel, PaymentStatus } from '../types';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
      embed?: (
        token: string,
        options: {
          embedId: string;
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export interface SnapTokenResponse {
  success: boolean;
  token: string;
  redirectUrl: string;
  orderId: string;
  grossAmount: number;
  isDemo?: boolean;
  message?: string;
}

export interface MidtransStatusResponse {
  orderId: string;
  status: PaymentStatus | string;
  paymentType?: string;
  grossAmount?: number;
  transactionTime?: string;
  settlementTime?: string;
  vaNumber?: string;
  bank?: string;
  transactionId?: string;
  raw?: any;
}

class MidtransService {
  private isSnapLoaded = false;
  private clientKey = '';

  /**
   * Load Midtrans Snap JS dynamically
   */
  async loadSnapScript(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (this.isSnapLoaded && window.snap) return true;

    try {
      // Get public config from server
      const cfgRes = await fetch('/api/midtrans/config');
      const cfg = await cfgRes.json();
      this.clientKey = cfg.clientKey || 'SB-Mid-client-demo';

      const scriptId = 'midtrans-snap-js';
      if (document.getElementById(scriptId)) {
        this.isSnapLoaded = true;
        return true;
      }

      const scriptUrl = cfg.isProduction 
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';

      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = scriptUrl;
        script.setAttribute('data-client-key', this.clientKey);
        script.async = true;
        script.onload = () => {
          this.isSnapLoaded = true;
          resolve(true);
        };
        script.onerror = () => {
          console.warn('Failed to load external Midtrans Snap JS, continuing with fallback modal.');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    } catch (e) {
      console.warn('Snap script load exception:', e);
      return false;
    }
  }

  /**
   * Request Snap token from backend Node.js
   */
  async createSnapToken(params: {
    orderId: string;
    grossAmount: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceName: string;
    unitCount: number;
  }): Promise<SnapTokenResponse> {
    const response = await fetch('/api/midtrans/create-snap-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Gagal membuat Snap token' }));
      throw new Error(err.error || 'Gagal berkomunikasi dengan Midtrans API');
    }

    return await response.json();
  }

  /**
   * Check status from backend
   */
  async checkStatus(orderId: string): Promise<MidtransStatusResponse> {
    const response = await fetch(`/api/midtrans/status/${encodeURIComponent(orderId)}`);
    if (!response.ok) {
      throw new Error('Gagal mengambil status transaksi Midtrans');
    }
    return await response.json();
  }

  /**
   * Simulate a quick sandbox settlement in testing
   */
  async simulatePayment(orderId: string, paymentChannel: string = 'qris', status: string = 'settlement') {
    const response = await fetch('/api/midtrans/simulate-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, paymentChannel, status }),
    });

    if (!response.ok) {
      throw new Error('Gagal melakukan simulasi pembayaran');
    }

    return await response.json();
  }
}

export const midtransService = new MidtransService();
