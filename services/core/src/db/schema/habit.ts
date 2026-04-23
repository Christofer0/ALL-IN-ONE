import { pgTable, uuid, varchar, date, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  emoji: varchar("emoji", { length: 10 }).notNull().default("⭐"),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 20 }).notNull().default("#4A70A9"),
  freq: varchar("freq", { length: 20 }).$type<"daily" | "weekday" | "custom">().notNull().default("daily"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    habitId: uuid("habit_id")
      .references(() => habits.id, { onDelete: "cascade" })
      .notNull(),
    logDate: date("log_date").notNull(), // format: YYYY-MM-DD
    done: boolean("done").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    habitDateUnique: uniqueIndex("habit_logs_habit_id_log_date_unique").on(
      table.habitId,
      table.logDate
    ),
  })
);

export const habitsRelations = relations(habits, ({ many }) => ({
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id],
  }),
}));
