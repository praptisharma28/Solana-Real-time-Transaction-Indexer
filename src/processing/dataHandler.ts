import { db } from '../database/client';
import { TransactionFilters } from './filters';

export class DataHandler {
  async handleTransaction(transactionUpdate: any) {
    try {
      const transaction = transactionUpdate.transaction;
      const signature = transaction.signature;
      const slot = BigInt(transaction.slot);
      const blockTime = transaction.blockTime ? new Date(transaction.blockTime * 1000) : null;

      const success = !transaction.meta?.err;
      const fee = transaction.meta?.fee ? BigInt(transaction.meta.fee) : null;
      const computeUnitsUsed = transaction.meta?.computeUnitsConsumed
        ? BigInt(transaction.meta.computeUnitsConsumed)
        : null;

      const accounts = transaction.transaction?.message?.accountKeys || [];

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
          instructions: transaction.transaction?.message?.instructions || [],
        },
        update: {
          success,
          fee,
          computeUnitsUsed,
        },
      });

      await this.handleLargeTransfer(transaction, signature, slot, blockTime);
      await this.handleMemoTransaction(transaction, signature);
      await this.handleFailedTransaction(transaction, signature, slot, blockTime);
    } catch (error) {
      console.error('Error handling transaction', error);
    }
  }

  async handleLargeTransfer(
    transaction: any,
    signature: string,
    slot: bigint,
    blockTime: Date | null
  ) {
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
                blockTime,
              },
              update: {},
            });
          }
        }
      }
    } catch (error) {
      console.error('Error handling large transfer', error);
    }
  }

  async handleMemoTransaction(transaction: any, signature: string) {
    const memos = TransactionFilters.extractMemoContent(transaction);
    if (memos.length === 0) return;

    try {
      const txRecord = await db.prisma.transaction.findUnique({
        where: { signature },
      });

      if (!txRecord) return;

      for (const memoContent of memos) {
        await db.prisma.memo.create({
          data: {
            content: memoContent,
            transactionId: txRecord.id,
          },
        });
      }
    } catch (error) {
      console.error('Error handling memo transaction', error);
    }
  }

  async handleFailedTransaction(
    transaction: any,
    signature: string,
    slot: bigint,
    blockTime: Date | null
  ) {
    const isSuccessful = !transaction.meta?.err;
    if (isSuccessful) return;

    try {
      const error = transaction.meta?.err ? JSON.stringify(transaction.meta.err) : 'Unknown error';
      const logs = transaction.meta?.logMessages || [];
      const accounts =
        transaction.transaction?.message?.accountKeys?.map((acc: any) => acc.toString()) || [];

      await db.prisma.failedTransaction.upsert({
        where: { signature },
        create: {
          signature,
          slot,
          error,
          logs,
          accounts,
          blockTime,
        },
        update: {},
      });
    } catch (error) {
      console.error('Error handling failed transaction', error);
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
          slot: BigInt(accountUpdate.slot),
        },
        update: {
          owner: account.owner.toString(),
          lamports: BigInt(account.lamports),
          data: account.data ? Buffer.from(account.data).toString('base64') : null,
          executable: account.executable,
          rentEpoch: BigInt(account.rentEpoch),
          slot: BigInt(accountUpdate.slot),
        },
      });
    } catch (error) {
      console.error('Error handling account update', error);
    }
  }

  async handleSlot(slotUpdate: any) {
    try {
      const slot = BigInt(slotUpdate.slot);
      const parent = slotUpdate.parent ? BigInt(slotUpdate.parent) : undefined;

      if (parent) {
        console.log(`[SLOT] ${new Date().toISOString()} - Slot: ${slot} (Parent: ${parent})`);
      } else {
        console.log(`[SLOT] ${new Date().toISOString()} - Slot: ${slot}`);
      }
    } catch (error) {
      console.error('Error handling slot update', error);
    }
  }
}
