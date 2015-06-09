<?php

session_start();

include 'includes/config.php';
include 'includes/functions.php';
include 'vendor/autoload.php';

// Initialize the database
$gDatabase = new mysqli( DB_HOST, DB_USER, DB_PASS, DB_NAME );

// Initialise the global user
$token = session_id();
$gUser = User::newFromToken( $token );

// Do the request
try {
	$controller = GET( 'controller' );
	$controller = ucfirst( strtolower( $controller ) ); // Normalise
	if ( !class_exists( $controller ) ) {
		throw new Exception( 'Not found', 404 );
	}
	$method = $_SERVER['REQUEST_METHOD'];
	$method = strtolower( $method ); // Normalise
	if ( !method_exists( $controller, $method ) ) {
		throw new Exception( 'Not found', 404 );
	}
	$RESPONSE = $controller::$method(); // Main call

} catch ( Exception $Exception ) {

	$RESPONSE['code'] = $Exception->getCode();
	$RESPONSE['message'] = $Exception->getMessage();
}

// Output the response
header( 'Content-Type: application/json' );
echo json_encode( $RESPONSE, JSON_NUMERIC_CHECK );