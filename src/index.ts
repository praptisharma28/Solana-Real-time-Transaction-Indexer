import dotenv from 'dotenv';
import { YellowstoneClient } from './grpc/client';
import { db } from './database/client';
import {
  createLargeTransferSubscription,
  createMemoSubscription,
  createFailedTxSubscription,
  createDeFiSubscription,
  createUSDCSubscription,
  createSlotSubscription,
} from './grpc/subscriptions';

dotenv.config();

async function main() {
  try {
    await db.connect();
    const client = new YellowstoneClient();
    const subscription = createSlotSubscription();

    await client.subscribe(subscription);
  } catch (error) {
    console.error('Fatal error starting indexer', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  try {
    await db.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await db.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown', error);
    process.exit(1);
  }
});

main().catch((error) => {
  console.error('Unhandled error in main', error);
  process.exit(1);
});
