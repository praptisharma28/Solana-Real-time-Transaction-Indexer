import dotenv from 'dotenv';
import Client, { SubscribeRequest } from '@triton-one/yellowstone-grpc';

dotenv.config();

async function testConnection() {
  console.log('Testing Yellowstone gRPC connection...');

  const endpoint = process.env.GRPC_ENDPOINT;
  const token = process.env.GRPC_TOKEN;

  if (!endpoint) {
    console.error('GRPC_ENDPOINT not found in .env file');
    process.exit(1);
  }

  console.log('Using endpoint:', endpoint);

  if (token && token.trim() !== '') {
    console.log('Token configured:', token.substring(0, 10) + '...');
  } else {
    console.log('Using ParaFi free server (no token required)');
  }

  try {
    const headers =
      token && token.trim() !== ''
        ? {
            'x-token': token,
          }
        : undefined;

    const client = new Client(endpoint, undefined, headers);
    console.log('Client created successfully');
    console.log('Attempting to connect...');

    const subscriptionRequest: SubscribeRequest = {
      accounts: {},
      transactions: {},
      slots: {
        'test-slot': {},
      },
      blocks: {},
      blocksMeta: {},
      accountsDataSlice: [],
      entry: {},
      commitment: undefined,
      ping: undefined,
    };

    let connectionSuccessful = false;
    let receivedData = false;

    const connectionTest = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!connectionSuccessful) {
          reject(new Error('Connection timeout after 30 seconds'));
        }
      }, 30000);

      client
        .subscribe()
        .then((stream) => {
          console.log('Stream created successfully');

          stream.on('data', (data: any) => {
            if (!receivedData) {
              receivedData = true;
              console.log('Received first data packet');
              console.log('Data type:', Object.keys(data));
              connectionSuccessful = true;
              clearTimeout(timeout);
              stream.end();
              resolve();
            }
          });

          stream.on('error', (error: any) => {
            console.error('Stream error:', error.message);
            clearTimeout(timeout);
            reject(error);
          });

          stream.on('end', () => {
            if (connectionSuccessful) {
              console.log('Stream ended gracefully');
            }
          });

          stream.write(subscriptionRequest, (error: any) => {
            if (error) {
              console.error('Failed to send subscription:', error.message);
              clearTimeout(timeout);
              reject(error);
            } else {
              console.log('Subscription request sent successfully');
            }
          });
        })
        .catch((error: any) => {
          console.error('Failed to create stream:', error.message);
          clearTimeout(timeout);
          reject(error);
        });
    });

    await connectionTest;
    console.log('Connection test completed successfully');
    console.log('🎉gRPC connection is working!');
  } catch (error: any) {
    console.error('Connection test failed');
    console.error('Error message:', error.message);

    if (error.message.includes('UNAUTHENTICATED') || error.message.includes('401')) {
      console.log('Authentication failed. For ParaFi free server, leave GRPC_TOKEN empty');
    } else if (error.message.includes('UNAVAILABLE') || error.message.includes('503')) {
      console.log('Service unavailable. Please check your GRPC_ENDPOINT');
    } else if (error.message.includes('timeout')) {
      console.log('Connection timeout - this might indicate network issues');
    } else if (error.message.includes('415')) {
      console.log(
        'Server rejected request format. Make sure GRPC_TOKEN is empty for ParaFi free server'
      );
    }
    process.exit(1);
  }
}

testConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
