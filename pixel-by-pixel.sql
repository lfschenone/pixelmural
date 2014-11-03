CREATE TABLE pixels (
	`x` INT NOT NULL,
	`y` INT NOT NULL,
	`ip` VARCHAR(50) NOT NULL,
	`facebook_id` VARCHAR(50) NOT NULL,
	`facebook_name` VARCHAR(50) NOT NULL,
	`facebook_email` VARCHAR(50) NOT NULL,
	`facebook_link` VARCHAR(50) NOT NULL,
	`time` INT UNSIGNED NOT NULL,
	`color` VARCHAR(7) NOT NULL,
	PRIMARY KEY( `x`, `y` )
);