<?php

session_start();

include 'includes/config.php';
include 'includes/functions.php';
include 'vendor/autoload.php';

Facebook\FacebookSession::setDefaultApplication( FACEBOOK_APP_ID, FACEBOOK_APP_SECRET );

$gDatabase = new mysqli( DB_HOST, DB_USER, DB_PASS, DB_NAME );

try {
	$token = SESSION( 'token', COOKIE( 'token' ) );
	$gUser = User::newFromToken( $token );
} catch ( Exception $exception ) {
	try {
		$username = $_SERVER['REMOTE_ADDR']; //IPs are treated as usernames
		$gUser = User::newFromName( $username );
	} catch ( Exception $exception ) {
		$gUser = new User;
		$gUser->username = $_SERVER['REMOTE_ADDR'];
		$gUser->id = $gUser->insert();
	}
}

$controller = GET( 'controller', DEFAULT_CONTROLLER );
$method = GET( 'method', DEFAULT_METHOD );
$controller::$method();