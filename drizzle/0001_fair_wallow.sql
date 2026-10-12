CREATE TABLE `contest_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`class_no` integer NOT NULL,
	`seat_no` integer NOT NULL,
	`student_no` text NOT NULL,
	`student_name` text NOT NULL,
	`spot_id` text NOT NULL,
	`spot_title` text NOT NULL,
	`title` text NOT NULL,
	`caption` text NOT NULL,
	`object_key` text NOT NULL,
	`mime` text NOT NULL,
	`bytes` integer NOT NULL,
	`token_hash` text NOT NULL,
	`submitted_at` text NOT NULL,
	`selected` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_contest_spot_class` ON `contest_photos` (`spot_id`,`class_no`);--> statement-breakpoint
CREATE TABLE `photo_owners` (
	`class_no` integer NOT NULL,
	`seat_no` integer NOT NULL,
	`token_hash` text NOT NULL,
	PRIMARY KEY(`class_no`, `seat_no`)
);
