import dotenv from 'dotenv';
import { YellowstoneClient } from './grpc/client';
import { db } from './database/client';
import { Logger } from './processing/logger';
import {
  createLargeTransferSubscription,
  createMemoSubscription,
  createFailedTxSubscription,
  createDeFiSubscription,
  createUSDCSubscription
} from './grpc/subscriptions';

// Load environment variables
dotenv.config();

const logger = new Logger();

async function main() {
  try {
    // Initialize database connection
    await db.connect();

    // Initialize Yellowstone client
    const client = new YellowstoneClient();

    // Choose your subscription mode (uncomment the one you want):
    
    // 1. Track large SOL transfers (>100 SOL)
    const subscription = createLargeTransferSubscription();
    
    // 2. Monitor memo program usage (great for payment processing)
    // const subscription = createMemoSubscription();
    
    // 3. Analyze failed transactions
    // const subscription = createFailedTxSubscription();
    
    // 4. Track DeFi activity (Raydium, Jupiter, Orca, Serum)
    // const subscription = createDeFiSubscription();
    
    // 5. Monitor USDC token transfers
    // const subscription = createUSDCSubscription();

    logger.info('🚀 Starting Solana Transaction Indexer...');
    logger.info('📡 Subscription mode: Large SOL Transfers (>100 SOL)');
    logger.info('🔗 Connecting to Yellowstone gRPC stream...');

    // Start indexing
    await client.subscribe(subscription);

  } catch (error) {
    logger.error('Fatal error starting indexer', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down indexer...');
  try {
    await db.disconnect();
    logger.success('✅ Database disconnected');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Received SIGTERM, shutting down...');
  try {
    await db.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
});

// Start the application
main().catch((error) => {
  logger.error('Unhandled error in main', error);
  process.exit(1);
});

// src/grpc/types.ts (additional gRPC types)
export interface SubscribeUpdateTransaction {
  transaction: {
    signature: string;
    isVote: boolean;
    transaction: {
      message: {
        header: {
          numRequiredSignatures: number;
          numReadonlySignedAccounts: number;
          numReadonlyUnsignedAccounts: number;
        };
        accountKeys: string[];
        recentBlockhash: string;
        instructions: Array<{
          programIdIndex: number;
          accounts: number[];
          data: string;
        }>;
      };
      signatures: string[];
    };
    meta: {
      err: any;
      fee: number;
      preBalances: number[];
      postBalances: number[];
      innerInstructions: any[];
      logMessages: string[];
      preTokenBalances: any[];
      postTokenBalances: any[];
      rewards: any[];
      computeUnitsConsumed?: number;
    };
  };
  slot: number;
}

export interface SubscribeUpdateAccount {
  account: {
    pubkey: string;
    lamports: number;
    owner: string;
    executable: boolean;
    rentEpoch: number;
    data: Uint8Array;
  };
  slot: number;
  isStartup: boolean;
}

export interface SubscribeUpdateSlot {
  slot: number;
  parent?: number;
  status: string;
}
