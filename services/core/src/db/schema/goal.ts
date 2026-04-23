import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  desc: text("desc"),
  tag: varchar("tag", { length: 100 }).notNull().default("General"),
  deadline: date("deadline").notNull(),
  status: varchar("status", { length: 20 })
    .$type<"on-track" | "at-risk" | "behind" | "completed">()
    .notNull()
    .default("on-track"),
  notes: text("notes"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const keyResults = pgTable("key_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  goalId: uuid("goal_id")
    .references(() => goals.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goalsRelations = relations(goals, ({ many }) => ({
  keyResults: many(keyResults),
}));

export const keyResultsRelations = relations(keyResults, ({ one }) => ({
  goal: one(goals, {
    fields: [keyResults.goalId],
    references: [goals.id],
  }),
}));
