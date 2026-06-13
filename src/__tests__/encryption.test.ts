import { describe, it, expect, beforeEach, afterEach } from "vitest";

// encryption.ts uses process.env.ENCRYPTION_KEY — set it before importing
const VALID_KEY = "a".repeat(64); // 64 hex chars = 32 bytes

describe("encrypt / decrypt", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = VALID_KEY;
  });

  afterEach(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  it("round-trips a simple string", async () => {
    const { encrypt, decrypt } = await import("@/lib/encryption");
    const original = "my-secret-api-key-12345";
    const encrypted = encrypt(original);
    expect(decrypt(encrypted)).toBe(original);
  });

  it("produces different ciphertext each time (random IV)", async () => {
    const { encrypt } = await import("@/lib/encryption");
    const text = "same input";
    const a = encrypt(text);
    const b = encrypt(text);
    expect(a).not.toBe(b);
  });

  it("encrypted output has iv:authTag:ciphertext format", async () => {
    const { encrypt } = await import("@/lib/encryption");
    const encrypted = encrypt("hello");
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(3);
    // IV is 16 bytes = 32 hex chars
    expect(parts[0]).toHaveLength(32);
    // Auth tag is 16 bytes = 32 hex chars
    expect(parts[1]).toHaveLength(32);
    // Ciphertext should be non-empty
    expect(parts[2].length).toBeGreaterThan(0);
  });

  it("round-trips unicode and special characters", async () => {
    const { encrypt, decrypt } = await import("@/lib/encryption");
    const text = "Привет мир 🔑 <script>alert(1)</script>";
    expect(decrypt(encrypt(text))).toBe(text);
  });

  it("round-trips empty string", async () => {
    const { encrypt, decrypt } = await import("@/lib/encryption");
    expect(decrypt(encrypt(""))).toBe("");
  });

  it("throws when ENCRYPTION_KEY is missing", async () => {
    const { encrypt } = await import("@/lib/encryption");
    delete process.env.ENCRYPTION_KEY;
    expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY");
  });

  it("throws when ENCRYPTION_KEY has wrong length", async () => {
    const { encrypt } = await import("@/lib/encryption");
    process.env.ENCRYPTION_KEY = "tooshort";
    expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY");
  });

  it("decrypt throws on tampered ciphertext", async () => {
    const { encrypt, decrypt } = await import("@/lib/encryption");
    const encrypted = encrypt("sensitive data");
    const parts = encrypted.split(":");
    // Flip a byte in the ciphertext
    parts[2] = parts[2].slice(0, -2) + "ff";
    expect(() => decrypt(parts.join(":"))).toThrow();
  });

  it("decrypt throws on invalid format", async () => {
    const { decrypt } = await import("@/lib/encryption");
    expect(() => decrypt("not:valid")).toThrow("Invalid encrypted data format");
    expect(() => decrypt("one")).toThrow("Invalid encrypted data format");
  });
});
