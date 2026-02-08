declare global {
  type BankTransaction = {
    time: number;
    receiver: string;
    trans_type: "deposit" | "withdraw";
    trans_id: string;
    issuer: string;
    message: string;
    amount: number;
    title: string;
  };

  type PersonalBankResponse = {
    citizenId: string | null;
    playerName: string | null;
    transactions: BankTransaction[];
    pagination: ApiPaginationMeta;
    cashBalance: number;
    bankBalance: number;
    isFrozen: number;
    message?: string;
  };

  type TeamBankResponse = {
    gangName: string;
    transactions: BankTransaction[];
    pagination: ApiPaginationMeta;
    balance: number;
    isFrozen: number;
    creator?: string | null;
    message?: string;
  };

  type InvestmentAccount = {
    id: string;
    label: string;
    category: string | null;
    amount: number;
    creator: string;
  };

  type InvestmentsResponse = {
    gangName: string;
    investments: InvestmentAccount[];
    message?: string;
  };

  type InvestmentTransactionsResponse = {
    accountId: string;
    transactions: BankTransaction[];
    pagination: ApiPaginationMeta;
    balance: number;
    isFrozen: number;
  };

  type AdminInvestmentCategory = {
    key: string;
    label: string;
    count: number;
  };

  type AdminInvestmentCategoriesResponse = {
    categories: AdminInvestmentCategory[];
    totalBusinesses: number;
  };

  type AdminGangOwnershipItem = {
    gangCode: string;
    gangLabel: string;
    ownershipCount: number;
  };

  type AdminGangOwnershipResponse = {
    gangs: AdminGangOwnershipItem[];
  };

  type AdminInvestmentDetailItem = {
    businessId: number;
    bankAccountId: string;
    label: string;
    category: string;
    map: string | null;
    owner: string | null;
    isOwned: boolean;
    updatedAt: string | Date;
    balance: number;
    creator: string | null;
    isFrozen: number;
  };

  type AdminInvestmentDetailResponse = {
    category: string | null;
    gang?: string | null;
    query?: string;
    totalItems: number;
    pagination: ApiPaginationMeta;
    items: AdminInvestmentDetailItem[];
  };

  type AdminGangOption = {
    name: string;
    label: string;
  };

  type AdminGangsResponse = {
    gangs: AdminGangOption[];
  };
}

export {};
