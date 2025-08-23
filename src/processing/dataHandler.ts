import { db } from '../database/client';
import { Logger } from './logger';
import { TransactionFilters } from './filters';

export class DataHandler {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  async handleTransaction(transactionUpdate: any) {
    try {
      const transaction = transactionUpdate.transaction;
      const signature = transaction.signature;
      const slot = BigInt(transaction.slot);
      const blockTime = transaction.blockTime ? new Date(transaction.blockTime * 1000) : null;

      // Extract basic transaction info
      const success = !transaction.meta?.err;
      const fee = transaction.meta?.fee ? BigInt(transaction.meta.fee) : null;
      const computeUnitsUsed = transaction.meta?.computeUnitsConsumed 
        ? BigInt(transaction.meta.computeUnitsConsumed) : null;

      // Extract account keys
      const accounts = transaction.transaction?.message?.accountKeys || [];

      // Store transaction
      await db.prisma.transaction.upsert({
        where: { signature },
        create: {
          signature,
          slot,
          blockTime,
          success,
          fee,
          computeUnitsUsed,
          accounts: accounts.map((acc: any) => acc.toString()),
          instructions: transaction.transaction?.message?.instructions || []
        },
        update: {
          success,
          fee,
          computeUnitsUsed
        }
      });

      // Handle specific transaction types
      await this.handleLargeTransfer(transaction, signature, slot, blockTime);
      await this.handleMemoTransaction(transaction, signature);
      await this.handleFailedTransaction(transaction, signature, slot, blockTime);

      this.logger.info(`Transaction processed: ${signature.slice(0, 16)}...`, {
        slot: slot.toString(),
        success,
        fee: fee?.toString()
      });

    } catch (error) {
      this.logger.error('Error handling transaction', error);
    }
  }

  async handleLargeTransfer(transaction: any, signature: string, slot: bigint, blockTime: Date | null) {
    if (!TransactionFilters.isLargeTransfer(transaction, 100)) return;

    try {
      const instructions = transaction.transaction?.message?.instructions || [];
      const accounts = transaction.transaction?.message?.accountKeys || [];

      for (const instruction of instructions) {
        if (instruction.programId === TransactionFilters.SYSTEM_PROGRAM) {
          const data = Buffer.from(instruction.data, 'base64');
          if (data.length >= 12 && data.readUInt32LE(0) === 2) {
            const lamports = data.readBigUInt64LE(4);
            const fromPubkey = accounts[instruction.accounts[0]]?.toString() || '';
            const toPubkey = accounts[instruction.accounts[1]]?.toString() || '';

            await db.prisma.largeTransfer.upsert({
              where: { signature },
              create: {
                signature,
                fromPubkey,
                toPubkey,
                lamports,
                slot,
                blockTime
              },
              update: {}
            });

            this.logger.transfer(
              fromPubkey,
              toPubkey,
              Number(lamports) / 1_000_000_000,
              signature
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error handling large transfer', error);
    }
  }

  async handleMemoTransaction(transaction: any, signature: string) {
    const memos = TransactionFilters.extractMemoContent(transaction);
    if (memos.length === 0) return;

    try {
      const txRecord = await db.prisma.transaction.findUnique({
        where: { signature }
      });

      if (!txRecord) return;

      for (const memoContent of memos) {
        await db.prisma.memo.create({
          data: {
            content: memoContent,
            transactionId: txRecord.id
          }
        });

        this.logger.memo(`Memo found in ${signature.slice(0, 16)}...`, memoContent);
      }
    } catch (error) {
      this.logger.error('Error handling memo transaction', error);
    }
  }

  async handleFailedTransaction(transaction: any, signature: string, slot: bigint, blockTime: Date | null) {
    const isSuccessful = !transaction.meta?.err;
    if (isSuccessful) return;

    try {
      const error = transaction.meta?.err ? JSON.stringify(transaction.meta.err) : 'Unknown error';
      const logs = transaction.meta?.logMessages || [];
      const accounts = transaction.transaction?.message?.accountKeys?.map((acc: any) => acc.toString()) || [];

      await db.prisma.failedTransaction.upsert({
        where: { signature },
        create: {
          signature,
          slot,
          error,
          logs,
          accounts,
          blockTime
        },
        update: {}
      });

      this.logger.warn(`Failed transaction: ${signature.slice(0, 16)}...`, { error, logsCount: logs.length });

    } catch (error) {
      this.logger.error('Error handling failed transaction', error);
    }
  }

  async handleAccount(accountUpdate: any) {
    try {
      const account = accountUpdate.account;
      const pubkey = account.pubkey.toString();
      
      await db.prisma.account.upsert({
        where: { pubkey },
        create: {
          pubkey,
          owner: account.owner.toString(),
          lamports: BigInt(account.lamports),
          data: account.data ? Buffer.from(account.data).toString('base64') : null,
          executable: account.executable,
          rentEpoch: BigInt(account.rentEpoch),
          slot: BigInt(accountUpdate.slot)
        },
        update: {
          owner: account.owner.toString(),
          lamports: BigInt(account.lamports),
          data: account.data ? Buffer.from(account.data).toString('base64') : null,
          executable: account.executable,
          rentEpoch: BigInt(account.rentEpoch),
          slot: BigInt(accountUpdate.slot)
        }
      });

      this.logger.success(`Account updated: ${pubkey.slice(0, 16)}...`, {
        owner: account.owner.toString().slice(0, 16) + '...',
        lamports: account.lamports.toString()
      });

    } catch (error) {
      this.logger.error('Error handling account update', error);
    }
  }

  async handleSlot(slotUpdate: any) {
    try {
      const slot = BigInt(slotUpdate.slot);
      const parent = slotUpdate.parent ? BigInt(slotUpdate.parent) : undefined;
      
      this.logger.slot(slot, parent);
    } catch (error) {
      this.logger.error('Error handling slot update', error);
    }
  }
}
