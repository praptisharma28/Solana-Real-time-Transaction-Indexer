export class Logger {
  private logLevel: string;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  info(message: string, data?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    if (data && this.logLevel === 'debug') {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  success(message: string, data?: any) {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`);
    if (data && this.logLevel === 'debug') {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  warn(message: string, data?: any) {
    console.log(`[WARN] ${new Date().toISOString()} - ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  error(message: string, error?: any) {
    console.log(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.log(error.stack || error);
    }
  }

  memo(message: string, content: string) {
    console.log(`[MEMO] ${new Date().toISOString()} - ${message}`);
    console.log(`Content: "${content}"`);
  }

  transfer(from: string, to: string, amount: number, signature: string) {
    console.log(`[TRANSFER] ${new Date().toISOString()}`);
    console.log(`  From: ${from.slice(0, 8)}...${from.slice(-8)}`);
    console.log(`  To:   ${to.slice(0, 8)}...${to.slice(-8)}`);
    console.log(`  Amount: ${amount} SOL`);
    console.log(`  Sig: ${signature.slice(0, 16)}...`);
  }

  slot(slotNumber: bigint, parent?: bigint) {
    console.log(
      `[SLOT] ${new Date().toISOString()} - Slot: ${slotNumber}${parent ? ` (Parent: ${parent})` : ''}`
    );
  }
}
