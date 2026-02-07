/**
 * Bank API Response Types
 * API Route: /api/user/bank/*
 */

/**
 * Bank transaction record
 */
export type BankTransaction = {
  time: number;
  receiver: string;
  trans_type: "deposit" | "withdraw";
  trans_id: string;
  issuer: string;
  message: string;
  amount: number;
  title: string;
};

/**
 * Pagination metadata
 */
export type PaginationMeta = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
};

/**
 * Personal Bank API response
 * API Route: /api/user/bank/personal
 * Query params: page (default: 1), limit (default: 10, max: 100)
 */
export type PersonalBankResponse = {
  citizenId: string | null;
  playerName: string | null;
  transactions: BankTransaction[];
  pagination: PaginationMeta;
  cashBalance: number;
  bankBalance: number;
  isFrozen: number;
  message?: string;
};

/**
 * Team Bank API response
 * API Route: /api/user/bank/team
 * Query params: page (default: 1), limit (default: 10, max: 100)
 */
export type TeamBankResponse = {
  gangName: string;
  transactions: BankTransaction[];
  pagination: PaginationMeta;
  balance: number;
  isFrozen: number;
  creator?: string | null;
  message?: string;
};

/**
 * Investment account
 */
export type InvestmentAccount = {
  id: string;
  label: string;
  category: string | null;
  amount: number;
  creator: string;
};

/**
 * Investments API response
 * API Route: /api/user/bank/investments
 */
export type InvestmentsResponse = {
  gangName: string;
  investments: InvestmentAccount[];
  message?: string;
};

/**
 * Investment Transactions API response
 * API Route: /api/user/bank/investments/[id]/transactions
 * Query params: page (default: 1), limit (default: 10, max: 100)
 */
export type InvestmentTransactionsResponse = {
  accountId: string;
  transactions: BankTransaction[];
  pagination: PaginationMeta;
  balance: number;
  isFrozen: number;
};

/**
 * Admin investment category summary
 * API Route: /api/admin/investment/categories
 */
export type AdminInvestmentCategory = {
  key: string;
  label: string;
  count: number;
};

export type AdminInvestmentCategoriesResponse = {
  categories: AdminInvestmentCategory[];
  totalBusinesses: number;
};

export type AdminGangOwnershipItem = {
  gangCode: string;
  gangLabel: string;
  ownershipCount: number;
};

export type AdminGangOwnershipResponse = {
  gangs: AdminGangOwnershipItem[];
};

/**
 * Admin investment detail
 * API Route: /api/admin/investment/detail?category=
 */
export type AdminInvestmentDetailItem = {
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

export type AdminInvestmentDetailResponse = {
  category: string | null;
  gang?: string | null;
  query?: string;
  totalItems: number;
  pagination: PaginationMeta;
  items: AdminInvestmentDetailItem[];
};

export type AdminGangOption = {
  name: string;
  label: string;
};

export type AdminGangsResponse = {
  gangs: AdminGangOption[];
};
