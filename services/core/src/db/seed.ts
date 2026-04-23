import { db } from "./index.js";
import { users } from "./schema/index.js";
import { hashPassword } from "../utils/auth.js";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🌱 Seeding admin user...");

  const adminEmail = "brilliancw30@gmail.com";
  const adminPassword = "abcd1234"; // Change this in production!

  const hashedPassword = await hashPassword(adminPassword);

  try {
    await db.insert(users).values({
      email: adminEmail,
      fullName: "Brillian Christofer", // Adding your name as seed
      passwordHash: hashedPassword,
    });
    console.log("✅ Admin user created successfully!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
  } catch (err) {
    if ((err as any).code === "23505") {
      console.log("ℹ️ Admin user already exists.");
    } else {
      console.error("❌ Seeding failed:", err);
    }
  }

  process.exit(0);
}

main();
