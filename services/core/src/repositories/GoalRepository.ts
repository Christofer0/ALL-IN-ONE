import { db } from "../db/index.js";
import { goals, keyResults } from "../db/schema/index.js";
import { eq, and } from "drizzle-orm";

export const GoalRepository = {
  async findAll() {
    return db.query.goals.findMany({
      with: {
        keyResults: true,
      },
      orderBy: (goals, { desc }) => [desc(goals.createdAt)],
    });
  },

  async findById(id: string) {
    return db.query.goals.findFirst({
      where: eq(goals.id, id),
      with: {
        keyResults: true,
      },
    });
  },

  async create(data: typeof goals.$inferInsert) {
    const [result] = await db.insert(goals).values(data).returning();
    return result;
  },

  async createKeyResults(krs: (typeof keyResults.$inferInsert)[]) {
    await db.insert(keyResults).values(krs);
  },

  async update(id: string, data: Partial<typeof goals.$inferInsert>) {
    const [result] = await db
      .update(goals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return result;
  },

  async archive(id: string) {
    await db
      .update(goals)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(eq(goals.id, id));
  },

  async delete(id: string) {
    await db.delete(goals).where(eq(goals.id, id));
  },

  async toggleKR(krId: string) {
    const [kr] = await db
      .select()
      .from(keyResults)
      .where(eq(keyResults.id, krId));
    
    if (!kr) throw new Error("Key Result not found");

    const [updated] = await db
      .update(keyResults)
      .set({ done: !kr.done, updatedAt: new Date() })
      .where(eq(keyResults.id, krId))
      .returning();
    
    return updated;
  },

  async updateKeyResult(krId: string, data: Partial<typeof keyResults.$inferInsert>) {
    const [result] = await db
      .update(keyResults)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(keyResults.id, krId))
      .returning();
    return result;
  },

  async deleteKeyResult(krId: string) {
    await db.delete(keyResults).where(eq(keyResults.id, krId));
  },
};
