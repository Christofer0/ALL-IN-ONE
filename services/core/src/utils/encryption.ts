import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// The key must be 32 bytes for aes-256-gcm
// We'll derive it from the master key in .env
const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY || "temporary_secret_key_change_me_immediately_32chars";

if (MASTER_KEY.length < 32) {
  console.warn("⚠️ ENCRYPTION_MASTER_KEY is too short. It should be 32 characters.");
}

export const encrypt = (text: string): string => {
  if (!text) return "";
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  // Create key using PBKDF2
  const key = crypto.pbkdf2Sync(MASTER_KEY, salt, 100000, 32, "sha256");
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  // Return as: salt:iv:tag:encryptedData
  return [
    salt.toString("hex"),
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex")
  ].join(":");
};

export const decrypt = (hash: string): string => {
  if (!hash || !hash.includes(":")) return "";
  
  const [saltHex, ivHex, tagHex, encryptedHex] = hash.split(":");
  
  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  
  const key = crypto.pbkdf2Sync(MASTER_KEY, salt, 100000, 32, "sha256");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  
  return decrypted.toString("utf8");
};
