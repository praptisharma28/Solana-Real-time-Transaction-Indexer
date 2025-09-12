import { DataHandler } from '../src/processing/dataHandler';
import { db } from '../src/database/client';
import { TransactionFilters } from '../src/processing/filters';

jest.mock('../src/database/client', () => ({
  db: {
    prisma: {
      largeTransfer: {
        upsert: jest.fn(),
      },
    },
  },
}));

jest.mock('../src/processing/filters', () => ({
  TransactionFilters: {
    isLargeTransfer: jest.fn().mockReturnValue(true),
    SYSTEM_PROGRAM: '11111111111111111111111111111111',
  },
}));

describe('DataHandler', () => {
  let dataHandler: DataHandler;

  beforeEach(() => {
    dataHandler = new DataHandler();
    jest.clearAllMocks();
  });

  it('should correctly handle a large transfer', async () => {
    const lamports = 150000000000n; // 150 SOL
    const buffer = Buffer.alloc(12);
    buffer.writeUInt32LE(2, 0); // Instruction index for transfer
    buffer.writeBigUInt64LE(lamports, 4);

    const mockTransaction = {
      transaction: {
        message: {
          accountKeys: ['from_pubkey', 'to_pubkey', '11111111111111111111111111111111'],
          instructions: [
            {
              programId: '11111111111111111111111111111111',
              accounts: [0, 1],
              data: buffer,
            },
          ],
        },
      },
      meta: {
        fee: 5000,
      },
    };

    const signature = 'test_signature';
    const slot = 12345n;
    const blockTime = new Date();

    await dataHandler.handleLargeTransfer(mockTransaction, signature, slot, blockTime);

    expect(db.prisma.largeTransfer.upsert).toHaveBeenCalledWith({
      where: { signature },
      create: {
        signature,
        fromPubkey: 'from_pubkey',
        toPubkey: 'to_pubkey',
        lamports,
        slot,
        blockTime,
      },
      update: {},
    });
  });
});
