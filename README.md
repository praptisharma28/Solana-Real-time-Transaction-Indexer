# Solana Real-time Transaction Indexer ⚡

[![Star this repo](https://img.shields.io/badge/⭐_Star-This_repo-lightgrey?style=flat)](https://github.com/praptisharma28/Solana-Real-time-Transaction-Indexer)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-9945FF?style=flat&logo=solana&logoColor=white)](https://solana.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance, real-time Solana blockchain indexer that streams live transaction data and stores it in PostgreSQL for analytics and monitoring.

For a full guide on indexer, read my blog here: [Indexing on Solana: A Complete Guide to Deposits, Withdrawals, Memos, and Security](https://medium.com/@praptii/indexing-on-solana-a-complete-guide-to-deposits-withdrawals-memos-and-security-4ecb2d2f3f69)

## What It Does

Stream live Solana blockchain data → Filter & Process → Store in Database → Real-time Analytics

- **Real-time Data**: Live blockchain updates via Yellowstone gRPC
- **Smart Filtering**: Large transfers, DeFi activity, memos, failed transactions
- **Analytics Ready**: Structured PostgreSQL storage for insights
- **Production Scale**: Handles Solana's 2000+ TPS throughput

## Demo Screenshots

<img width="589" height="281" alt="gRPC Connection Success" src="https://github.com/user-attachments/assets/1d3c45ff-5fba-4c58-beff-df67bfe75b20" />

*Real-time slot streaming - indexer connected to Solana mainnet*

<img width="516" height="322" alt="Database Connection & Slot Processing" src="https://github.com/user-attachments/assets/863b5f50-6711-442d-9ce0-b51ef6f76daa" />

*Database connected, processing live blockchain data*

<img width="298" height="765" alt="PostgreSQL Database Schema" src="https://github.com/user-attachments/assets/2f958098-77a7-454c-9f09-fa4e2a57ee3b" />

*Clean database schema for blockchain analytics*

## Quick Start

```bash
git clone https://github.com/praptisharma28/Solana-Real-time-Transaction-Indexer
cd Solana-Real-time-Transaction-Indexer
npm install

cp .env.example .env

npx prisma db push --schema=src/database/schema.prisma

npm run test:connection  # Test gRPC
npm run test:db         # Test database

npm run dev
```

## Subscription Modes

Switch between different data streams in `src/index.ts`:

```typescript
const subscription = createSlotSubscription();

// Track whale movements (>100 SOL transfers)
const subscription = createLargeTransferSubscription();

// Monitor DeFi protocols (Raydium, Jupiter, Orca)
const subscription = createDeFiSubscription();

// Capture memo-based payments
const subscription = createMemoSubscription();

const subscription = createFailedTxSubscription();
```

## Live Output Examples

**Slot Updates (Network Health)**
```
[SLOT] 2025-08-24T07:51:26.161Z - Slot: 362152525 (Parent: 362152524)
```

**Whale Transfers**
```
[TRANSFER] 2025-08-24T07:51:26.161Z
  From: 7xKXtg2C...QoQ9HD8i
  To:   9WzDXwBb...i4qRvKn3
  Amount: 150.5 SOL
```

**Payment Memos**
```
[MEMO] 2025-08-24T07:51:26.161Z - Payment ID: TXN_12345
```

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Streaming**: Yellowstone gRPC (Solana's data pipeline)
- **Database**: PostgreSQL + Prisma ORM
- **Development**: Hot reload, Docker support

## Use Cases

- **DeFi Analytics**: Track protocol volumes, arbitrage opportunities
- **Whale Watching**: Monitor large SOL movements in real-time
- **Payment Processing**: Memo-based payment confirmations
- **Compliance**: Suspicious activity detection and reporting
- **Research**: Network health monitoring and usage patterns

## Environment Setup

```bash
GRPC_ENDPOINT="your-yellowstone-endpoint"
DATABASE_URL="postgresql://user:pass@localhost:5432/solana_indexer"

LOG_LEVEL="info"
MAX_RECONNECT_ATTEMPTS=5
```

## Docker Deployment

```bash
docker-compose up -d

docker-compose logs -f indexer
```

## Database Schema

5 optimized tables for blockchain analytics:

- **Transaction**: Core transaction data, fees, status
- **LargeTransfer**: SOL transfers above threshold
- **Memo**: Payment references and notes
- **Account**: Account state updates
- **FailedTransaction**: Error analysis and debugging

## Production Ready

- Automatic reconnection handling
- Error logging and monitoring
- Configurable data retention
- Connection pooling support
- Docker health checks

## License

MIT License - feel free to use for commercial projects!

## Star This Repo

If this helped you build something cool, give it a star!✨ 

---

**Built with ❤️ by [Prapti](https://x.com/praptichilling) for the Solana ecosystem**




