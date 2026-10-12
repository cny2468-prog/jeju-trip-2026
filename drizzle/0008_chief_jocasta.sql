ALTER TABLE `contest_photos` ADD `thumbnail_key` text;--> statement-breakpoint
ALTER TABLE `contest_photos` ADD `thumbnail_bytes` integer DEFAULT 0 NOT NULL;