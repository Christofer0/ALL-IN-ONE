import { pgTable, unique, uuid, varchar, text, boolean, timestamp, jsonb, foreignKey, uniqueIndex, date, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const blogs = pgTable("blogs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 100 }).notNull(),
	excerpt: text().notNull(),
	content: text(),
	coverImage: text("cover_image"),
	isPublished: boolean("is_published").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("blogs_slug_unique").on(table.slug),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	fullName: varchar("full_name", { length: 255 }),
	username: varchar({ length: 255 }),
	shortBio: text("short_bio"),
	avatarUrl: text("avatar_url"),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_username_unique").on(table.username),
]);

export const projects = pgTable("projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 100 }).notNull(),
	description: text().notNull(),
	content: text(),
	coverImage: text("cover_image"),
	techStack: jsonb("tech_stack").default([]).notNull(),
	isPublished: boolean("is_published").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	demoUrl: text("demo_url"),
	githubUrl: text("github_url"),
	isFeatured: boolean("is_featured").default(false).notNull(),
	overview: text(),
	problem: text(),
	solution: text(),
	results: text(),
	duration: varchar({ length: 100 }),
	impact: varchar({ length: 100 }),
	teamSize: varchar("team_size", { length: 100 }),
}, (table) => [
	unique("projects_slug_unique").on(table.slug),
]);

export const folders = pgTable("folders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	icon: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const notes = pgTable("notes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	folderId: uuid("folder_id"),
	title: varchar({ length: 255 }).notNull(),
	content: text(),
	tags: jsonb().default([]),
	isPinned: boolean("is_pinned").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.folderId],
			foreignColumns: [folders.id],
			name: "notes_folder_id_folders_id_fk"
		}).onDelete("cascade"),
]);

export const activityLogs = pgTable("activity_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	action: varchar({ length: 100 }).notNull(),
	entityType: varchar("entity_type", { length: 100 }).notNull(),
	entityId: uuid("entity_id"),
	details: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const habits = pgTable("habits", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	emoji: varchar({ length: 10 }).default('⭐').notNull(),
	name: varchar({ length: 255 }).notNull(),
	color: varchar({ length: 20 }).default('#4A70A9').notNull(),
	freq: varchar({ length: 20 }).default('daily').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const habitLogs = pgTable("habit_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	habitId: uuid("habit_id").notNull(),
	logDate: date("log_date").notNull(),
	done: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("habit_logs_habit_id_log_date_unique").using("btree", table.habitId.asc().nullsLast().op("date_ops"), table.logDate.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.habitId],
			foreignColumns: [habits.id],
			name: "habit_logs_habit_id_habits_id_fk"
		}).onDelete("cascade"),
]);

export const transactions = pgTable("transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	date: varchar({ length: 10 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 10 }).notNull(),
	amount: integer().notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const goals = pgTable("goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	desc: text(),
	tag: varchar({ length: 100 }).default('General').notNull(),
	deadline: date().notNull(),
	status: varchar({ length: 20 }).default('on-track').notNull(),
	notes: text(),
	isArchived: boolean("is_archived").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const keyResults = pgTable("key_results", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	goalId: uuid("goal_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	done: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.goalId],
			foreignColumns: [goals.id],
			name: "key_results_goal_id_goals_id_fk"
		}).onDelete("cascade"),
]);

export const systemSettings = pgTable("system_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	openaiKey: text("openai_key"),
	anthropicKey: text("anthropic_key"),
	githubKey: text("github_key"),
	smtpEmail: varchar("smtp_email", { length: 255 }),
	smtpPassword: text("smtp_password"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	geminiKey: text("gemini_key"),
	smtpServer: varchar("smtp_server", { length: 255 }),
	smtpPort: text("smtp_port"),
});
