<?php

session_start();

include 'includes/config.php';
include 'includes/functions.php';

$gDatabase = new mysqli( DB_HOST, DB_USER, DB_PASS, DB_NAME );

$gController = GET( 'controller', DEFAULT_CONTROLLER );

$gMethod = GET( 'method', DEFAULT_METHOD );

$gController::$gMethod();