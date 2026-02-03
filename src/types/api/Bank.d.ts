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
