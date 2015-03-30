<?php

// Debugging
ini_set( 'display_errors', 1 );
error_reporting( E_ALL );

// General settings
define( 'BASE', 'http://local.pixel-by-pixel.net/pixel-by-pixel/' );
define( 'TITLE', 'Pixel by Pixel' );
define( 'DESCRIPTION', 'An infinite canvas of collaborative pixel art. Come leave your mark!' );
define( 'CONTACT_EMAIL', 'contact@pixel-by-pixel.net' );

// Defaults
define( 'DEFAULT_TOPLEFTX', 0 );
define( 'DEFAULT_TOPLEFTY', 0 );
define( 'DEFAULT_PIXELSIZE', 4 );
date_default_timezone_set( 'America/Argentina/Buenos_Aires' );

// Database
define( 'DB_HOST', 'localhost' );
define( 'DB_USER', 'root' );
define( 'DB_PASS', 'penta' );
define( 'DB_NAME', 'pixel-by-pixel' );

// Facebook
define( 'FACEBOOK_APP_ID', '707049712677506' );
define( 'FACEBOOK_APP_SECRET', '2e44dccf08c4631809022e1b0bc43f4e' );