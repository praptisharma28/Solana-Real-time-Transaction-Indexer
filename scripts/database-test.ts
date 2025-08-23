import dotenv from 'dotenv';
import { db } from '../src/database/client';

dotenv.config();

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  
  try {
    await db.connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await db.prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test passed:', result);
    
    // Test table creation/access
    const transactionCount = await db.prisma.transaction.count();
    console.log(`✅ Transactions table accessible. Current count: ${transactionCount}`);
    
    await db.disconnect();
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();
