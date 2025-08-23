// scripts/test-connection.ts
import dotenv from 'dotenv';
import { YellowstoneClient } from '../src/grpc/client';
import { createPingSubscription } from '../src/grpc/subscriptions';

dotenv.config();

async function testConnection() {
  console.log('🔍 Testing Yellowstone gRPC connection...');

  const endpoint = process.env.GRPC_ENDPOINT;
  const token = process.env.GRPC_TOKEN;

  if (!endpoint) {
    console.error('❌ GRPC_ENDPOINT not found in .env file');
    process.exit(1);
  }

  if (!token || token === 'your_api_token_here') {
    console.error('❌ Valid GRPC_TOKEN not found in .env file');
    console.log('💡 Please update your .env file with real Yellowstone credentials');
    process.exit(1);
  }

  console.log('📝 Using endpoint:', endpoint);
  console.log('🔑 Token configured:', token.substring(0, 10) + '...');

  try {
    console.log('✅ Client created successfully');
    console.log('📡 Attempting to connect...');

    // Create client without parameters first
    const client = new YellowstoneClient();

    // Use a simple ping subscription for testing
    const pingSubscription = createPingSubscription();

    let connectionSuccessful = false;

    // Test connection with timeout
    const connectionTest = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!connectionSuccessful) {
          reject(new Error('Connection timeout after 15 seconds'));
        }
      }, 15000);

      try {
        // Try to subscribe with the ping subscription
        client
          .subscribe(pingSubscription)
          .then(() => {
            console.log('✅ Subscription created successfully');
            connectionSuccessful = true;
            clearTimeout(timeout);
            resolve();
          })
          .catch((error: any) => {
            console.error('❌ Subscription failed:', error.message);
            clearTimeout(timeout);
            reject(error);
          });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });

    // Wait for connection test
    await connectionTest;
    console.log('✅ Connection test completed successfully');
    console.log('🎉 gRPC connection is working!');
  } catch (error: any) {
    console.error('❌ Connection test failed');
    console.error('Error message:', error.message);

    if (error.message.includes('UNAUTHENTICATED') || error.message.includes('401')) {
      console.log('💡 Authentication failed. Please check your GRPC_TOKEN');
    } else if (error.message.includes('UNAVAILABLE') || error.message.includes('503')) {
      console.log('💡 Service unavailable. Please check your GRPC_ENDPOINT');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Connection timeout - this might indicate network issues');
    }
    process.exit(1);
  }
}

testConnection().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
