<?php

session_start();

include 'includes/config.php';
include 'includes/functions.php';
include 'vendor/autoload.php';

$gDatabase = new mysqli( DB_HOST, DB_USER, DB_PASS, DB_NAME );

Facebook\FacebookSession::setDefaultApplication( FACEBOOK_APP_ID, FACEBOOK_APP_SECRET );

try {
	$token = SESSION( 'token', COOKIE( 'token' ) );
	$gUser = User::newFromToken( $token );
} catch ( Exception $exception ) {
	try {
		$name = $_SERVER['REMOTE_ADDR']; //IPs are the names of anonymous users
		$gUser = User::newFromName( $name );
	} catch ( Exception $Exception ) {
		$gUser = new User;
		$gUser->name = $_SERVER['REMOTE_ADDR'];
		$gUser->join_time = $_SERVER['REQUEST_TIME'];
		$gUser->status = 'anon';
		$gUser->id = $gUser->insert();
	}
}
$gUser->last_seen = $_SERVER['REQUEST_TIME'];
$gUser->update();

$controller = GET( 'controller', DEFAULT_CONTROLLER );
$method = GET( 'method', DEFAULT_METHOD );
$topLeftX = GET( 'topLeftX', DEFAULT_TOPLEFTX );
$topLeftY = GET( 'topLeftY', DEFAULT_TOPLEFTY );
$pixelSize = GET( 'pixelSize', DEFAULT_PIXELSIZE );
$controller::$method();