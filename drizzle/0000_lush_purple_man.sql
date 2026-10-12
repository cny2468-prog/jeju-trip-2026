CREATE TABLE `reflections` (
	`class_no` integer NOT NULL,
	`seat_no` integer NOT NULL,
	`student_no` text NOT NULL,
	`payload` text NOT NULL,
	`token_hash` text NOT NULL,
	`submitted_at` text NOT NULL,
	PRIMARY KEY(`class_no`, `seat_no`)
);
