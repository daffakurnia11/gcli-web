declare global {
  type PaymentStatus =
    | "pending"
    | "paid"
    | "failed"
    | "expired"
    | "canceled"
    | "refunded";

  type AdminPaymentRecapItem = {
    id: number;
    invoiceNumber: string;
    provider: string;
    channel: string | null;
    amount: number;
    currency: string;
    status: PaymentStatus | string;
    payerAccountId: number | null;
    payerUsername: string;
    purposeType: string;
    purposeRef: string | null;
    checkoutUrl: string | null;
    paidAt: string | null;
    expiredAt: string | null;
    createdAt: string;
    updatedAt: string;
  };

  type AdminPaymentRecapSummary = {
    totalAmount: number;
    paidAmount: number;
    totalPaid: number;
    totalPending: number;
    totalFailed: number;
    totalExpired: number;
    totalCanceled: number;
    totalRefunded: number;
  };

  type AdminPaymentRecapResponse = {
    query: string;
    status: string | null;
    purposeType: string | null;
    provider: string | null;
    items: AdminPaymentRecapItem[];
    summary: AdminPaymentRecapSummary;
    pagination: ApiPaginationMeta;
  };

  type AdminPaymentDetailResponse = {
    payment: {
      id: number;
      invoiceNumber: string;
      provider: string;
      channel: string | null;
      amount: number;
      currency: string;
      status: string;
      payerAccountId: number | null;
      payerUsername: string;
      purposeType: string;
      purposeRef: string | null;
      checkoutUrl: string | null;
      paidAt: string | null;
      expiredAt: string | null;
      createdAt: string;
      updatedAt: string;
    };
  };

  type UserPaymentRecapItem = {
    id: number;
    invoiceNumber: string;
    provider: string;
    channel: string | null;
    amount: number;
    currency: string;
    status: PaymentStatus | string;
    purposeType: string;
    purposeRef: string | null;
    checkoutUrl: string | null;
    paidAt: string | null;
    expiredAt: string | null;
    createdAt: string;
    updatedAt: string;
  };

  type UserPaymentRecapSummary = {
    totalAmount: number;
    paidAmount: number;
    totalPaid: number;
    totalPending: number;
    totalFailed: number;
    totalExpired: number;
    totalCanceled: number;
    totalRefunded: number;
  };

  type UserPaymentRecapResponse = {
    query: string;
    status: string | null;
    purposeType: string | null;
    provider: string | null;
    items: UserPaymentRecapItem[];
    summary: UserPaymentRecapSummary;
    pagination: ApiPaginationMeta;
  };

  type UserPaymentDetailResponse = {
    payment: {
      id: number;
      invoiceNumber: string;
      provider: string;
      channel: string | null;
      amount: number;
      currency: string;
      status: string;
      purposeType: string;
      purposeRef: string | null;
      checkoutUrl: string | null;
      paidAt: string | null;
      expiredAt: string | null;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export {};
