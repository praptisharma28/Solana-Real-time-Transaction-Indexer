#!/bin/bash

echo "🚀 Setting up Solana Transaction Indexer..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual values!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate --schema=src/database/schema.prisma

# Setup database (if using Docker)
if command -v docker-compose &> /dev/null; then
    echo "🐳 Starting database with Docker..."
    docker-compose up -d postgres
    sleep 10
    
    echo "🔧 Running database migrations..."
    npx prisma db push --schema=src/database/schema.prisma
else
    echo "⚠️  Docker not found. Please set up your database manually."
    echo "   Then run: npx prisma db push --schema=src/database/schema.prisma"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with correct values"
echo "2. Run 'npm run test:connection' to test gRPC connection"
echo "3. Run 'npm run test:db' to test database connection"
echo "4. Run 'npm run dev' to start the indexer"
