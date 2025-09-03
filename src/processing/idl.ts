import bs58 from 'bs58';

export type IDLParser = (rawBase64: string) => any | null;

// Common program ids
export const SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
export const SPL_TOKEN_2022 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';


export function parseSPLTokenAccount(rawBase64: string) {
  try {
    const buf = Buffer.from(rawBase64, 'base64');

    if (buf.length < 72) return null;

    const mint = bs58.encode(buf.slice(0, 32));
    const owner = bs58.encode(buf.slice(32, 64));
    const amount = Number(buf.readBigUInt64LE(64));

    return {
      __type: 'spl-token-account',
      mint,
      owner,
      amount,
    };
  } catch (err) {
    return null;
  }
}

export const parsers: Record<string, IDLParser> = {
  [SPL_TOKEN_PROGRAM]: parseSPLTokenAccount,
  [SPL_TOKEN_2022]: parseSPLTokenAccount,
};

export function parseByProgram(programId: string, rawBase64: string) {
  const p = parsers[programId];
  if (!p) return null;
  return p(rawBase64);
}
