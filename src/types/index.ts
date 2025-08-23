// src/types/index.ts

// Application-specific types
export interface TransactionData {
  signature: string;
  from?: string;
  to?: string;
  amount?: number;
  token?: string;
  programId?: string;
  blockTime?: number;
  slot?: number;
  fee?: number;
  status: 'success' | 'failed';
  instructionType?: string;
  memo?: string;
}

export interface ProcessedTransaction {
  id: string;
  signature: string;
  blockTime: Date;
  slot: number;
  fee: number;
  status: string;
  programIds: string[];
  accounts: string[];
  memo?: string;
  amount?: number;
  token?: string;
  instructionType?: string;
}

export interface FilterOptions {
  minAmount?: number;
  maxAmount?: number;
  programs?: string[];
  accounts?: string[];
  includeSuccess?: boolean;
  includeFailed?: boolean;
}

export interface IndexerStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  uptime: number;
  lastProcessedSlot: number;
}

// Re-export the official Yellowstone types - DON'T redefine them
export {
  SubscribeRequest,
  SubscribeResponse,
  SubscribeUpdate,
  SubscribeUpdateTransaction,
  SubscribeUpdateAccount,
  SubscribeUpdateSlot,
  SubscribeUpdateBlock,
  SubscribeUpdatePing,
} from '@triton-one/yellowstone-grpc';

// Keep your custom interfaces for backwards compatibility if needed
export interface CustomSubscribeRequest {
  accounts?: Record<string, CustomAccountSubscription>;
  slots?: Record<string, CustomSlotSubscription>;
  transactions?: Record<string, CustomTransactionSubscription>;
  transactionsStatus?: Record<string, CustomTransactionStatusSubscription>;
  blocks?: Record<string, CustomBlockSubscription>;
  blocksMeta?: Record<string, CustomBlockMetaSubscription>;
  entry?: Record<string, CustomEntrySubscription>;
  accountsDataSlice?: CustomAccountDataSlice[];
}

export interface CustomAccountSubscription {
  owner?: string[];
  account?: string[];
  filters?: CustomAccountFilter[];
}

export interface CustomTransactionSubscription {
  accountInclude?: string[];
  accountExclude?: string[];
  accountRequired?: string[];
  failed?: boolean;
}

export interface CustomAccountFilter {
  memcmp?: {
    offset: number;
    bytes: string;
  };
  datasize?: number;
}

export interface CustomSlotSubscription {}
export interface CustomTransactionStatusSubscription {}
export interface CustomBlockSubscription {}
export interface CustomBlockMetaSubscription {}
export interface CustomEntrySubscription {}
export interface CustomAccountDataSlice {}

