<?php

include 'includes/config.php';
include 'vendor/autoload.php';

$gDatabase = new mysqli( DB_HOST, DB_USER, DB_PASS, DB_NAME );

$Result = $gDatabase->query( 'SELECT * FROM users' );
while ( $DATA = $Result->fetch_assoc() ) {
	$User = new User( $DATA );

	
}