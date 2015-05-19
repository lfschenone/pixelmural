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

// Initialise the global user object
$token = SESSION( 'token', COOKIE( 'token' ) );
$gUser = User::newFromToken( $token );
if ( !$gUser ) {
	$ip = $_SERVER['REMOTE_ADDR'];
	$gUser = User::newFromIp( $ip );
}
if ( !$gUser ) {
	$gUser = new User;
	$gUser->name = $ip; // IPs are the names of anonymous users
	$gUser->status = 'anon';
	$gUser->id = $gUser->insert();
}

// Do the request
$method = GET( 'method' );
$response = Ajax::$method();

// Output the response
header( 'Content-Type: application/json' );
echo json_encode( $response, JSON_NUMERIC_CHECK );