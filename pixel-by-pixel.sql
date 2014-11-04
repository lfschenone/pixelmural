CREATE TABLE `pixels` (
	`x` INT NOT NULL,
	`y` INT NOT NULL,
	`author_id` INT UNSIGNED NOT NULL,
	`time` INT UNSIGNED NOT NULL,
	`color` VARCHAR(7) NOT NULL,
	PRIMARY KEY ( `x`, `y` ),
	FOREIGN KEY ( `author_id` ) REFERENCES `users`( `id` )
);

CREATE TABLE `users` (
	`id` INT AUTO_INCREMENT,
	`time` INT UNSIGNED NOT NULL,
	`name` VARCHAR(50) NOT NULL,
	`email` VARCHAR(50) NOT NULL,
	`link` VARCHAR(50) NOT NULL,
	`pixel_count` INT UNSIGNED NOT NULL,
	PRIMARY KEY ( `id` )
);