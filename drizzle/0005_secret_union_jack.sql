CREATE TABLE `photo_upload_slots` (
	`slot_no` integer PRIMARY KEY NOT NULL,
	`lease_key` text,
	`state` text DEFAULT 'idle' NOT NULL,
	`expires_at` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO photo_upload_slots (slot_no) VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20);
