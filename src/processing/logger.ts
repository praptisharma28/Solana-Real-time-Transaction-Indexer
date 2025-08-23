import chalk from 'chalk';

export class Logger {
  private logLevel: string;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  info(message: string, data?: any) {
    console.log(chalk.blue(`[INFO] ${new Date().toISOString()} - ${message}`));
    if (data && this.logLevel === 'debug') {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
  }

  success(message: string, data?: any) {
    console.log(chalk.green(`[SUCCESS] ${new Date().toISOString()} - ${message}`));
    if (data && this.logLevel === 'debug') {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
  }

  warn(message: string, data?: any) {
    console.log(chalk.yellow(`[WARN] ${new Date().toISOString()} - ${message}`));
    if (data) {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
  }

  error(message: string, error?: any) {
    console.log(chalk.red(`[ERROR] ${new Date().toISOString()} - ${message}`));
    if (error) {
      console.log(chalk.red(error.stack || error));
    }
  }

  memo(message: string, content: string) {
    console.log(chalk.magenta(`[MEMO] ${new Date().toISOString()} - ${message}`));
    console.log(chalk.cyan(`Content: "${content}"`));
  }

  transfer(from: string, to: string, amount: number, signature: string) {
    console.log(chalk.yellow(`[TRANSFER] ${new Date().toISOString()}`));
    console.log(chalk.white(`  From: ${from.slice(0, 8)}...${from.slice(-8)}`));
    console.log(chalk.white(`  To:   ${to.slice(0, 8)}...${to.slice(-8)}`));
    console.log(chalk.white(`  Amount: ${amount} SOL`));
    console.log(chalk.gray(`  Sig: ${signature.slice(0, 16)}...`));
  }

  slot(slotNumber: bigint, parent?: bigint) {
    console.log(chalk.cyan(`[SLOT] ${new Date().toISOString()} - Slot: ${slotNumber}${parent ? ` (Parent: ${parent})` : ''}`));
  }
}
