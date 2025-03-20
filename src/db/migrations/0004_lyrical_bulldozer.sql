ALTER TABLE `users_table` ADD `created_at` text DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `time`;