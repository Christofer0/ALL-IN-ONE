ALTER TABLE "system_settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "system_settings" CASCADE;--> statement-breakpoint
DROP INDEX "habit_logs_habit_id_log_date_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "habit_logs_habit_id_log_date_unique" ON "habit_logs" USING btree ("habit_id","log_date");