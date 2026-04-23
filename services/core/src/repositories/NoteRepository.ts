import { db } from "../db/index.js";
import { notes } from "../db/schema/index.js";
import { eq, desc, and, ilike, or } from "drizzle-orm";

export const NoteRepository = {
  async findAll(folderId?: string, search?: string) {
    const conditions = [];
    if (folderId) {
      conditions.push(eq(notes.folderId, folderId));
    }
    if (search) {
      conditions.push(
        or(
          ilike(notes.title, `%${search}%`),
          ilike(notes.content, `%${search}%`)
        )
      );
    }

    const query = db.select().from(notes);
    
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    return query.orderBy(desc(notes.isPinned), desc(notes.updatedAt));
  },

  async findById(id: string) {
    return db.query.notes.findFirst({
      where: eq(notes.id, id),
    });
  },

  async create(data: typeof notes.$inferInsert) {
    const [result] = await db.insert(notes).values(data).returning();
    return result;
  },

  async update(id: string, data: Partial<typeof notes.$inferInsert>) {
    const [result] = await db
      .update(notes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return result;
  },

  async delete(id: string) {
    const [result] = await db.delete(notes).where(eq(notes.id, id)).returning();
    return result;
  },
};
