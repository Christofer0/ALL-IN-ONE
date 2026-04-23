import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

export const UserRepository = {
  async findByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },

  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  async create(data: typeof users.$inferInsert) {
    const [result] = await db.insert(users).values(data).returning();
    return result;
  },

  async update(id: string, data: Partial<typeof users.$inferInsert>) {
    const [result] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result;
  },
  async findFirstUser() {
    return db.query.users.findFirst();
  },
};
