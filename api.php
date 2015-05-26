<?php

session_start();

include 'includes/config.php';
include 'includes/functions.php';
include 'vendor/autoload.php';

// Initialize the database
$gDatabase = new mysqli( DB_HOST, DB_USER, DB_PASS, DB_NAME );

// Initialise the global user
$token = SESSION( 'token' );
$gUser = User::newFromToken( $token );

// Do the request
$controller = GET( 'controller' );
$controller = ucfirst( strtolower( $controller ) ); // Normalise
$method = $_SERVER['REQUEST_METHOD'];
$method = strtolower( $method ); // Normalise
$response = $controller::$method();

// Output the response
header( 'Content-Type: application/json' );
echo json_encode( $response, JSON_NUMERIC_CHECK );