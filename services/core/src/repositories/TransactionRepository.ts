import { db } from "../db/index.js";
import { transactions } from "../db/schema/index.js";
import { eq, desc } from "drizzle-orm";

export const TransactionRepository = {
  async findAll() {
    return db.select().from(transactions).orderBy(desc(transactions.date), desc(transactions.createdAt));
  },

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return result || null;
  },

  async create(data: typeof transactions.$inferInsert) {
    const [result] = await db.insert(transactions).values(data).returning();
    return result;
  },

  async update(id: string, data: Partial<typeof transactions.$inferInsert>) {
    const [result] = await db
      .update(transactions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return result;
  },

  async delete(id: string) {
    const [result] = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning();
    return result;
  },
};
