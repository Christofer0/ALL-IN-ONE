import { db } from "../db/index.js";
import { projects } from "../db/schema/index.js";
import { eq, desc, and } from "drizzle-orm";

export const ProjectRepository = {
  async findAll() {
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  },

  async findAllPublished() {
    return db
      .select()
      .from(projects)
      .where(eq(projects.isPublished, true))
      .orderBy(desc(projects.isFeatured), desc(projects.createdAt));
  },

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return result || null;
  },

  async findBySlug(slug: string, onlyPublished = false) {
    const conditions = [eq(projects.slug, slug)];
    if (onlyPublished) conditions.push(eq(projects.isPublished, true));

    const [result] = await db
      .select()
      .from(projects)
      .where(and(...conditions));
    
    return result || null;
  },

  async create(data: typeof projects.$inferInsert) {
    const [result] = await db.insert(projects).values(data).returning();
    return result;
  },

  async update(id: string, data: Partial<typeof projects.$inferInsert>) {
    const [result] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result;
  },

  async delete(id: string) {
    const [result] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    return result;
  },
};
