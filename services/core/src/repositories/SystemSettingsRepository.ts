import { db } from "../db/index.js";
import { systemSettings } from "../db/schema/index.js";
import { sql } from "drizzle-orm";

export const SystemSettingsRepository = {
  async getSettings() {
    // We only have one row, so we findFirst
    return db.query.systemSettings.findFirst();
  },

  async updateSettings(data: any) {
    const existing = await this.getSettings();
    
    if (existing) {
      const [result] = await db
        .update(systemSettings)
        .set({ ...data, updatedAt: new Date() })
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(systemSettings)
        .values(data)
        .returning();
      return result;
    }
  }
};
