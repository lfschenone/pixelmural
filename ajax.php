<?php
/**
 * Entry point for all AJAX requests
 */

session_start();

include 'includes/config.php';
include 'includes/functions.php';
include 'vendor/autoload.php';

// Initialize the database
$gDatabase = new mysqli( DB_HOST, DB_USER, DB_PASS, DB_NAME );

// Initialize the Facebook SDK
Facebook\FacebookSession::setDefaultApplication( FACEBOOK_APP_ID, FACEBOOK_APP_SECRET );

// Build the global user object
$token = SESSION( 'token', COOKIE( 'token' ) );
$gUser = User::newFromToken( $token );
// If there is no user, check if it's a returning visitor
if ( !$gUser ) {
	$name = $_SERVER['REMOTE_ADDR']; // IPs are treated as names of anonymous users
	$gUser = User::newFromName( $name );
}
// If there is still no user, create a new one
if ( !$gUser ) {
	$gUser = new User;
	$gUser->name = $_SERVER['REMOTE_ADDR'];
	$gUser->join_time = $_SERVER['REQUEST_TIME'];
	$gUser->status = 'anon';
	$gUser->id = $gUser->insert();
}

$gUser->last_seen = $_SERVER['REQUEST_TIME'];
$gUser->update();

$method = GET( 'method' );
$response = Ajax::$method();

header( 'Content-Type: application/json' );

echo json_encode( $response );