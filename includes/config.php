<?php

// Debugging
ini_set( 'display_errors', 1 );
error_reporting( E_ALL );

// General settings
define( 'BASE', 'http://pixel-by-pixel.net/' );
define( 'TITLE', 'Pixel by Pixel' );
define( 'DESCRIPTION', 'An infinite canvas for collaborative pixel art. Come leave your mark!' );
define( 'CONTACT_EMAIL', 'contact@pixel-by-pixel.net' );

// Defaults
define( 'DEFAULT_CONTROLLER', 'Board' );
define( 'DEFAULT_METHOD', 'view' );
define( 'DEFAULT_TOPLEFTX', 0 );
define( 'DEFAULT_TOPLEFTY', 0 );
define( 'DEFAULT_PIXELSIZE', 4 );
date_default_timezone_set( 'America/Argentina/Buenos_Aires' );

// Database settings
define( 'DB_HOST', 'localhost' );
define( 'DB_USER', 'root' );
define( 'DB_PASS', '' );
define( 'DB_NAME', 'pixel-by-pixel' );

// Facebook app
define( 'FACEBOOK_APP_ID', '' );
define( 'FACEBOOK_APP_SECRET', '' );