export class TransactionFilters {
  static readonly SYSTEM_PROGRAM = '11111111111111111111111111111111';
  static readonly MEMO_PROGRAM = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
  static readonly TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  static readonly SPL_TOKEN_2022 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

  static readonly RAYDIUM_AMM = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
  static readonly JUPITER_V6 = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4';
  static readonly ORCA_WHIRLPOOL = 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc';
  static readonly SERUM_DEX = '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin';

  static isLargeTransfer(transaction: any, minAmount: number = 100): boolean {
    try {
      const instructions = transaction.transaction?.transaction?.message?.instructions || [];

      for (const instruction of instructions) {
        if (instruction.programId === this.SYSTEM_PROGRAM) {
          const data = Buffer.from(instruction.data, 'base64');
          if (data.length >= 12 && data.readUInt32LE(0) === 2) {
            const lamports = data.readBigUInt64LE(4);
            const solAmount = Number(lamports) / 1_000_000_000;
            if (solAmount >= minAmount) {
              return true;
            }
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  static extractMemoContent(transaction: any): string[] {
    try {
      const instructions = transaction.transaction?.transaction?.message?.instructions || [];
      const memos: string[] = [];

      for (const instruction of instructions) {
        if (instruction.programId === this.MEMO_PROGRAM) {
          const data = Buffer.from(instruction.data, 'base64');
          memos.push(data.toString('utf-8'));
        }
      }
      return memos;
    } catch {
      return [];
    }
  }

  static isDeFiTransaction(transaction: any): boolean {
    try {
      const instructions = transaction.transaction?.transaction?.message?.instructions || [];
      const defiPrograms = [this.RAYDIUM_AMM, this.JUPITER_V6, this.ORCA_WHIRLPOOL, this.SERUM_DEX];

      return instructions.some((instruction: any) => defiPrograms.includes(instruction.programId));
    } catch {
      return false;
    }
  }

  static extractTransferAmount(transaction: any): number | null {
    try {
      const instructions = transaction.transaction?.transaction?.message?.instructions || [];

      for (const instruction of instructions) {
        if (instruction.programId === this.SYSTEM_PROGRAM) {
          const data = Buffer.from(instruction.data, 'base64');
          if (data.length >= 12 && data.readUInt32LE(0) === 2) {
            const lamports = data.readBigUInt64LE(4);
            return Number(lamports) / 1_000_000_000;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }
}
