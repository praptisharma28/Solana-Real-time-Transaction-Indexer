// src/grpc/subscriptions.ts
import { SubscribeRequest } from '@triton-one/yellowstone-grpc';
import bs58 from 'bs58';

export function createLargeTransferSubscription(): SubscribeRequest {
  return {
    slots: {},
    accounts: {},
    transactions: {
      'large-transfers': {
        vote: false,
        failed: false,
        signature: undefined,
        accountInclude: ['11111111111111111111111111111111'], // System Program
        accountExclude: [],
        accountRequired: ['11111111111111111111111111111111'],
      },
    },
    blocks: {},
    blocksMeta: {},
    accountsDataSlice: [],
    entry: {},
    commitment: undefined,
    ping: undefined,
  };
}

export function createMemoSubscription(): SubscribeRequest {
  return {
    slots: {},
    accounts: {},
    transactions: {
      'memo-transactions': {
        vote: false,
        failed: false,
        signature: undefined,
        accountInclude: ['MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'],
        accountExclude: [],
        accountRequired: [],
      },
    },
    blocks: {},
    blocksMeta: {},
    accountsDataSlice: [],
    entry: {},
    commitment: undefined,
    ping: undefined,
  };
}

export function createFailedTxSubscription(): SubscribeRequest {
  return {
    slots: {},
    accounts: {},
    transactions: {
      'failed-transactions': {
        vote: false,
        failed: true,
        signature: undefined,
        accountInclude: [],
        accountExclude: [],
        accountRequired: [],
      },
    },
    blocks: {},
    blocksMeta: {},
    accountsDataSlice: [],
    entry: {},
    commitment: undefined,
    ping: undefined,
  };
}

export function createDeFiSubscription(): SubscribeRequest {
  return {
    slots: {},
    accounts: {
      'defi-accounts': {
        account: [],
        owner: [
          '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium AMM
          'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter V6
          'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca Whirlpool
          '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', // Serum DEX
        ],
        filters: [],
      },
    },
    transactions: {
      'defi-transactions': {
        vote: false,
        failed: false,
        signature: undefined,
        accountInclude: [
          '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium AMM
          'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter V6
          'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca Whirlpool
          '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', // Serum DEX
        ],
        accountExclude: [],
        accountRequired: [],
      },
    },
    blocks: {},
    blocksMeta: {},
    accountsDataSlice: [],
    entry: {},
    commitment: undefined,
    ping: undefined,
  };
}

export function createTokenSubscription(tokenMints: string[]): SubscribeRequest {
  return {
    slots: {},
    accounts: {
      'token-accounts': {
        account: [],
        owner: ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'], // SPL Token Program
        filters: [], // Simplified - remove complex filters for now
      },
    },
    transactions: {
      'token-transfers': {
        vote: false,
        failed: false,
        signature: undefined,
        accountInclude: ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'],
        accountExclude: [],
        accountRequired: [],
      },
    },
    blocks: {},
    blocksMeta: {},
    accountsDataSlice: [],
    entry: {},
    commitment: undefined,
    ping: undefined,
  };
}

// Popular token subscription presets
export function createUSDCSubscription(): SubscribeRequest {
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  return createTokenSubscription([USDC_MINT]);
}

export function createUSDTSubscription(): SubscribeRequest {
  const USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';
  return createTokenSubscription([USDT_MINT]);
}

export function createSOLSubscription(): SubscribeRequest {
  const WSOL_MINT = 'So11111111111111111111111111111111111111112';
  return createTokenSubscription([WSOL_MINT]);
}

// Simple ping subscription for connection testing
export function createPingSubscription(): SubscribeRequest {
  return {
    slots: {},
    accounts: {},
    transactions: {},
    blocks: {},
    blocksMeta: {},
    accountsDataSlice: [],
    entry: {},
    commitment: undefined,
    ping: { id: 1 },
  };
}
