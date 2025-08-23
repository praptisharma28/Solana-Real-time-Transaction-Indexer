const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function healthCheck() {
  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    console.log('Health check passed');
    process.exit(0);
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

healthCheck();
