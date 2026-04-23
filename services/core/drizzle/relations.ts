import { relations } from "drizzle-orm/relations";
import { folders, notes, habits, habitLogs, goals, keyResults } from "./schema";

export const notesRelations = relations(notes, ({one}) => ({
	folder: one(folders, {
		fields: [notes.folderId],
		references: [folders.id]
	}),
}));

export const foldersRelations = relations(folders, ({many}) => ({
	notes: many(notes),
}));

export const habitLogsRelations = relations(habitLogs, ({one}) => ({
	habit: one(habits, {
		fields: [habitLogs.habitId],
		references: [habits.id]
	}),
}));

export const habitsRelations = relations(habits, ({many}) => ({
	habitLogs: many(habitLogs),
}));

export const keyResultsRelations = relations(keyResults, ({one}) => ({
	goal: one(goals, {
		fields: [keyResults.goalId],
		references: [goals.id]
	}),
}));

export const goalsRelations = relations(goals, ({many}) => ({
	keyResults: many(keyResults),
}));