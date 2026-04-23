import { db } from "../db/index.js";
import { blogs } from "../db/schema/index.js";
import { eq, desc, and } from "drizzle-orm";

export const BlogRepository = {
  async findAll() {
    return db.select().from(blogs).orderBy(desc(blogs.createdAt));
  },

  async findAllPublished() {
    return db
      .select()
      .from(blogs)
      .where(eq(blogs.isPublished, true))
      .orderBy(desc(blogs.createdAt));
  },

  async findBySlug(slug: string, onlyPublished = false) {
    const conditions = [eq(blogs.slug, slug)];
    if (onlyPublished) conditions.push(eq(blogs.isPublished, true));

    return db.query.blogs.findFirst({
      where: and(...conditions),
    });
  },

  async findById(id: string) {
    return db.query.blogs.findFirst({
      where: eq(blogs.id, id),
    });
  },

  async create(data: typeof blogs.$inferInsert) {
    const [result] = await db.insert(blogs).values(data).returning();
    return result;
  },

  async update(id: string, data: Partial<typeof blogs.$inferInsert>) {
    const [result] = await db
      .update(blogs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(blogs.id, id))
      .returning();
    return result;
  },

  async delete(id: string) {
    const [result] = await db.delete(blogs).where(eq(blogs.id, id)).returning();
    return result;
  },
};
