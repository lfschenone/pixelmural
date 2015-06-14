<?php

// Debugging
ini_set( 'display_errors', 1 );
error_reporting( E_ALL );

// General settings
define( 'BASE', 'https://pixelbypixel-lfschenone.c9.io/' );
define( 'TITLE', 'Pixel by Pixel' );
define( 'DESCRIPTION', 'An infinite canvas of collaborative pixel art. Come leave your mark!' );
date_default_timezone_set( 'America/Argentina/Buenos_Aires' );

// Defaults
define( 'DEFAULT_CENTERX', 0 );
define( 'DEFAULT_CENTERY', 0 );
define( 'DEFAULT_PIXELSIZE', 2 );

// Database
define( 'DB_HOST', getenv('IP') );
define( 'DB_USER', getenv('C9_USER') );
define( 'DB_PASS', '' );
define( 'DB_NAME', 'c9' );
define( 'DB_PORT', 3306 );

// Facebook
define( 'FACEBOOK_APP_ID', '707049712677506' );
define( 'FACEBOOK_APP_SECRET', '2e44dccf08c4631809022e1b0bc43f4e' );