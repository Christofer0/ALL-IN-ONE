import { db } from "../db/index.js";
import { activityLogs } from "../db/schema/index.js";

export const LogRepository = {
  async create(data: typeof activityLogs.$inferInsert) {
    const [result] = await db.insert(activityLogs).values(data).returning();
    return result;
  },
};
