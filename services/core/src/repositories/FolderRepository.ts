import { db } from "../db/index.js";
import { folders } from "../db/schema/index.js";
import { eq, asc } from "drizzle-orm";

export const FolderRepository = {
  async findAll() {
    return db.select().from(folders).orderBy(asc(folders.name));
  },

  async findById(id: string) {
    return db.query.folders.findFirst({
      where: eq(folders.id, id),
    });
  },

  async create(data: typeof folders.$inferInsert) {
    const [result] = await db.insert(folders).values(data).returning();
    return result;
  },

  async update(id: string, data: Partial<typeof folders.$inferInsert>) {
    const [result] = await db
      .update(folders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(folders.id, id))
      .returning();
    return result;
  },

  async delete(id: string) {
    const [result] = await db.delete(folders).where(eq(folders.id, id)).returning();
    return result;
  },
};
