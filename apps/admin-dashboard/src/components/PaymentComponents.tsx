'use client';

import { useState } from 'react';

const PAYMENT_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  unpaid: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Unpaid' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
  paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
  failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
  refunded: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Refunded' },
};

interface PaymentStatusBadgeProps {
  status: string;
  paidAt?: string | null;
}

export function PaymentStatusBadge({ status, paidAt }: PaymentStatusBadgeProps) {
  const colors = PAYMENT_STATUS_COLORS[status] || PAYMENT_STATUS_COLORS.unpaid;
  const formattedDate = paidAt ? new Date(paidAt).toLocaleDateString() : null;

  return (
    <div className="flex items-center gap-2">
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
        {colors.label}
      </span>
      {formattedDate && <span className="text-xs text-gray-600">{formattedDate}</span>}
    </div>
  );
}

interface InvoicePaymentButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentStatus: string;
  onPaymentInitiated?: () => void;
}

export function InvoicePaymentButton({
  invoiceId,
  invoiceNumber,
  amount,
  paymentStatus,
  onPaymentInitiated,
}: InvoicePaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create checkout session');
      }

      const { url } = await res.json();
      if (url) {
        onPaymentInitiated?.();
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message || 'Error initiating payment');
      console.error('Payment initiation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = paymentStatus === 'paid' || loading;

  return (
    <div className="space-y-2">
      <button
        onClick={handleCreateCheckout}
        disabled={isDisabled}
        className={`px-4 py-2 rounded font-medium text-white transition-colors ${
          isDisabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {loading ? 'Creating checkout...' : 'Pay Invoice'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {paymentStatus === 'paid' && (
        <p className="text-sm text-green-600">This invoice has been paid.</p>
      )}
      <p className="text-xs text-gray-600">Amount: ${(amount / 100).toFixed(2)}</p>
    </div>
  );
}
