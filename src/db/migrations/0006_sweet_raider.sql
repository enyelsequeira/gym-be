CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`last_name` text NOT NULL,
	`password` text NOT NULL,
	`type` text DEFAULT 'USER' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`email` text NOT NULL,
	`height` real,
	`weight` real,
	`target_weight` real,
	`country` text,
	`city` text,
	`phone` text,
	`occupation` text,
	`date_of_birth` integer,
	`gender` text,
	`activity_level` text,
	`first_login` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);