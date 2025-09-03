// idl.test.ts
import bs58 from "bs58";
import { parseSPLTokenAccount, parseByProgram, SPL_TOKEN_PROGRAM, SPL_TOKEN_2022 } from "./idl";

describe("SPL Token Account Parser", () => {
  function makeValidBase64(mintBytes?: Buffer, ownerBytes?: Buffer, amount = 123n) {
    const buf = Buffer.alloc(72);
    (mintBytes ?? Buffer.alloc(32, 1)).copy(buf, 0);      // mint (0x01 default)
    (ownerBytes ?? Buffer.alloc(32, 2)).copy(buf, 32);    // owner (0x02 default)
    buf.writeBigUInt64LE(amount, 64);                     // amount
    return buf.toString("base64");
  }

  it("parses a valid SPL token account", () => {
    const base64 = makeValidBase64();
    const result = parseSPLTokenAccount(base64);

    console.log("Deserialized SPL Token Account:", result);

    expect(result).not.toBeNull();
    expect(result?.__type).toBe("spl-token-account");
    expect(result?.mint).toBe(bs58.encode(Buffer.alloc(32, 1)));
    expect(result?.owner).toBe(bs58.encode(Buffer.alloc(32, 2)));
    expect(result?.amount).toBe(123);
  });

  it("returns null for too-short buffers", () => {
    const shortBase64 = Buffer.alloc(10).toString("base64");
    const result = parseSPLTokenAccount(shortBase64);

    console.log("Too-short buffer result:", result);

    expect(result).toBeNull();
  });

  it("returns null for invalid base64", () => {
    const result = parseSPLTokenAccount("!!notbase64!!");

    console.log("Invalid base64 result:", result);

    expect(result).toBeNull();
  });
});

describe("parseByProgram", () => {
  function makeValidBase64() {
    const buf = Buffer.alloc(72);
    Buffer.alloc(32, 3).copy(buf, 0);   // mint
    Buffer.alloc(32, 4).copy(buf, 32);  // owner
    buf.writeBigUInt64LE(999n, 64);     // amount
    return buf.toString("base64");
  }

  const validBase64 = makeValidBase64();

  it("dispatches to SPL_TOKEN_PROGRAM parser", () => {
    const result = parseByProgram(SPL_TOKEN_PROGRAM, validBase64);

    console.log("parseByProgram SPL_TOKEN_PROGRAM:", result);

    expect(result?.__type).toBe("spl-token-account");
    expect(result?.amount).toBe(999);
  });

  it("dispatches to SPL_TOKEN_2022 parser", () => {
    const result = parseByProgram(SPL_TOKEN_2022, validBase64);

    console.log("parseByProgram SPL_TOKEN_2022:", result);

    expect(result?.__type).toBe("spl-token-account");
    expect(result?.amount).toBe(999);
  });

  it("returns null for unknown program id", () => {
    const result = parseByProgram("UnknownProgramId", validBase64);

    console.log("parseByProgram UnknownProgramId:", result);

    expect(result).toBeNull();
  });
});
