import crypto from "crypto";

/**
 * Encrypts a string using AES-256-GCM.
 * The key must be a 64-character hex string (32 bytes).
 */
export function encrypt(text: string): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string in environment variables",
    );
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(key, "hex"),
    iv,
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // Format: iv:authTag:encryptedContent
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string previously encrypted with AES-256-GCM.
 */
export function decrypt(encryptedData: string): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string in environment variables",
    );
  }

  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encryptedText = Buffer.from(parts[2], "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key, "hex"),
    iv,
  );

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText.toString("hex"), "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
