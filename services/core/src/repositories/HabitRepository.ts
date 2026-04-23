import { db } from "../db/index.js";
import { habits, habitLogs } from "../db/schema/index.js";
import { eq, and, gte, lte } from "drizzle-orm";

export const HabitRepository = {
  async findAll() {
    return db.select().from(habits);
  },

  async findLogsByDateRange(habitId: string, from: string, to: string) {
    return db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, habitId),
          gte(habitLogs.logDate, from),
          lte(habitLogs.logDate, to)
        )
      );
  },

  async findLogByDate(habitId: string, date: string) {
    const [result] = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.logDate, date)));
    return result || null;
  },

  async upsertLog(habitId: string, logDate: string, done: boolean) {
    await db
      .insert(habitLogs)
      .values({ habitId, logDate, done })
      .onConflictDoUpdate({
        target: [habitLogs.habitId, habitLogs.logDate],
        set: { done },
      });
  },

  async create(data: typeof habits.$inferInsert) {
    const [result] = await db.insert(habits).values(data).returning();
    return result;
  },

  async delete(id: string) {
    await db.delete(habits).where(eq(habits.id, id));
  },
};
