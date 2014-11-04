<?php

session_start();

include 'includes/config.php';
include 'includes/functions.php';

// Facebook SDK
include 'vendor/facebook/php-sdk-v4/src/Facebook/FacebookSession.php';
include 'vendor/facebook/php-sdk-v4/src/Facebook/FacebookRedirectLoginHelper.php';
include 'vendor/facebook/php-sdk-v4/src/Facebook/FacebookRequest.php';
include 'vendor/facebook/php-sdk-v4/src/Facebook/FacebookResponse.php';
use Facebook\FacebookSession;
use Facebook\FacebookRequest;
use Facebook\GraphUser;
use Facebook\FacebookRequestException;
FacebookSession::setDefaultApplication( FACEBOOK_APP_ID, FACEBOOK_APP_SECRET );
$helper = new FacebookCanvasLoginHelper();
try {
	$session = $helper->getSession();
} catch( FacebookRequestException $ex ) {
	echo 1;
} catch( \Exception $ex ) {
	echo 2;
}
if ( $session ) {
	echo 3;
}

$gDatabase = new mysqli( DB_HOST, DB_USER, DB_PASS, DB_NAME );

$gController = GET( 'controller', DEFAULT_CONTROLLER );

$gMethod = GET( 'method', DEFAULT_METHOD );

$gController::$gMethod();