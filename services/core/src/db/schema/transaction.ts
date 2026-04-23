import { pgTable, uuid, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  description: varchar("description", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  type: varchar("type", { length: 10 }).$type<"income" | "expense">().notNull(),
  amount: integer("amount").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
