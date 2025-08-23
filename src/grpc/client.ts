import Client, { SubscribeRequest, SubscribeUpdate } from "@triton-one/yellowstone-grpc";
import { DataHandler } from '../processing/dataHandler';
import { Logger } from '../processing/logger';
import { SubscribeRequest as CustomSubscribeRequest } from '../types';

export class YellowstoneClient {
  private client: Client;
  private dataHandler: DataHandler;
  private logger: Logger;
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

    this.client = new Client(endpoint, undefined, {
      'x-token': token
    });
    
    this.dataHandler = new DataHandler();
    this.logger = new Logger();
    this.maxReconnectAttempts = parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '5');
    this.reconnectDelay = parseInt(process.env.RECONNECT_DELAY_MS || '5000');
  }

  async subscribe(subscriptionRequest: CustomSubscribeRequest): Promise<void> {
    try {
      this.logger.info('Connecting to Yellowstone gRPC stream...');
      
      const stream = await this.client.subscribe();
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Set up stream event handlers
      this.setupStreamHandlers(stream, subscriptionRequest);

      // Send subscription request
      await this.sendSubscription(stream, subscriptionRequest);

      this.logger.success('Successfully subscribed to Yellowstone stream');

      // Wait for stream to close
      await this.waitForStreamClose(stream);

    } catch (error) {
      this.logger.error('Failed to connect to Yellowstone stream', error);
      await this.handleReconnection(subscriptionRequest);
    }
  }

  private setupStreamHandlers(stream: any, subscriptionRequest: CustomSubscribeRequest): void {
    stream.on('data', this.handleUpdate.bind(this));
    
    stream.on('error', (error: Error) => {
      this.logger.error('Stream error occurred', error);
      this.isConnected = false;
      this.handleReconnection(subscriptionRequest);
    });

    stream.on('end', () => {
      this.logger.warn('Stream ended');
      this.isConnected = false;
      this.handleReconnection(subscriptionRequest);
    });

    stream.on('close', () => {
      this.logger.warn('Stream closed');
      this.isConnected = false;
    });
  }

  private async sendSubscription(stream: any, subscriptionRequest: CustomSubscribeRequest): Promise<void> {
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
      // Handle different types of updates
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
        this.logger.info(`Block update: ${data.block.blockhash}`, {
          slot: data.block.slot,
          blockHeight: data.block.blockHeight
        });
      }

    } catch (error) {
      this.logger.error('Error processing update', error);
    }
  }

  private async handleReconnection(subscriptionRequest: CustomSubscribeRequest): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnection attempts reached. Exiting...');
      process.exit(1);
    }

    this.reconnectAttempts++;
    this.logger.warn(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms...`);

    setTimeout(async () => {
      try {
        await this.subscribe(subscriptionRequest);
      } catch (error) {
        this.logger.error('Reconnection failed', error);
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
