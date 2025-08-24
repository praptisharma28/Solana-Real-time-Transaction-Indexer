import Client, { SubscribeRequest, SubscribeUpdate } from '@triton-one/yellowstone-grpc';
import { DataHandler } from '../processing/dataHandler';
import { SubscribeRequest as CustomSubscribeRequest } from '../types';

export class YellowstoneClient {
  private client: Client;
  private dataHandler: DataHandler;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private isConnected: boolean = false;

  constructor() {
    const endpoint = process.env.GRPC_ENDPOINT;
    const token = process.env.GRPC_TOKEN;

    if (!endpoint) {
      throw new Error('GRPC_ENDPOINT environment variable is required');
    }

    const headers =
      token && token.trim() !== ''
        ? {
            'x-token': token,
          }
        : undefined;

    this.client = new Client(endpoint, undefined, headers);
    this.dataHandler = new DataHandler();
    this.maxReconnectAttempts = parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '5');
    this.reconnectDelay = parseInt(process.env.RECONNECT_DELAY_MS || '5000');
  }

  async subscribe(subscriptionRequest: SubscribeRequest): Promise<void> {
    try {
      const stream = await this.client.subscribe();
      this.isConnected = true;
      this.reconnectAttempts = 0;

      this.setupStreamHandlers(stream, subscriptionRequest);
      await this.sendSubscription(stream, subscriptionRequest);
      await this.waitForStreamClose(stream);
    } catch (error) {
      console.error('Failed to connect to Yellowstone stream', error);
      await this.handleReconnection(subscriptionRequest);
    }
  }

  private setupStreamHandlers(stream: any, subscriptionRequest: SubscribeRequest): void {
    stream.on('data', this.handleUpdate.bind(this));

    stream.on('error', (error: Error) => {
      console.error('Stream error occurred', error);
      this.isConnected = false;
      this.handleReconnection(subscriptionRequest);
    });

    stream.on('end', () => {
      console.warn('Stream ended');
      this.isConnected = false;
      this.handleReconnection(subscriptionRequest);
    });

    stream.on('close', () => {
      console.warn('Stream closed');
      this.isConnected = false;
    });
  }

  private async sendSubscription(
    stream: any,
    subscriptionRequest: SubscribeRequest
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      stream.write(subscriptionRequest, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private async waitForStreamClose(stream: any): Promise<void> {
    return new Promise<void>((resolve) => {
      stream.on('end', () => resolve());
      stream.on('close', () => resolve());
    });
  }

  private async handleUpdate(data: SubscribeUpdate): Promise<void> {
    try {
      if (data.transaction) {
        await this.dataHandler.handleTransaction(data.transaction);
      }

      if (data.account) {
        await this.dataHandler.handleAccount(data.account);
      }

      if (data.slot) {
        await this.dataHandler.handleSlot(data.slot);
      }

      if (data.block) {
        console.log(`Block update: ${data.block.blockhash}`, {
          slot: data.block.slot,
          blockHeight: data.block.blockHeight,
        });
      }
    } catch (error) {
      console.error('Error processing update', error);
    }
  }

  private async handleReconnection(subscriptionRequest: SubscribeRequest): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Exiting...');
      process.exit(1);
    }

    this.reconnectAttempts++;
    console.warn(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms...`
    );

    setTimeout(async () => {
      try {
        await this.subscribe(subscriptionRequest);
      } catch (error) {
        console.error('Reconnection failed', error);
      }
    }, this.reconnectDelay);
  }

  public isStreamConnected(): boolean {
    return this.isConnected;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}
