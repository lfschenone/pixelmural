<?php

session_start();

include 'includes/config.php';
include 'includes/functions.php';
include 'vendor/autoload.php';

Facebook\FacebookSession::setDefaultApplication( FACEBOOK_APP_ID, FACEBOOK_APP_SECRET );

$gDatabase = new mysqli( DB_HOST, DB_USER, DB_PASS, DB_NAME );

$controller = GET( 'controller', DEFAULT_CONTROLLER );

$method = GET( 'method', DEFAULT_METHOD );

$controller::$method();