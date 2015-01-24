<?php

include 'includes/config.php';
include 'includes/functions.php';
include 'vendor/autoload.php';

$gDatabase = new mysqli( DB_HOST, DB_USER, DB_PASS, DB_NAME );

$topLeftX = DEFAULT_TOPLEFTX;
$topLeftY = DEFAULT_TOPLEFTY;
$pixelSize = DEFAULT_PIXELSIZE;

$f = '00000'; // Frame number

// Create the first frame manually
$Image = new Image( 1200, 800 );
$Image->setColorFromHex( '#aaaaaa' );
$Image->fill();
$Image->save( 'frames/frame' . $f . '.png' );
echo 'Frame ' . $f . ' created' . PHP_EOL;

$Result = $gDatabase->query( 'SELECT * FROM pixels ORDER BY time ASC' );
while ( $DATA = $Result->fetch_assoc() ) {
	$Pixel = new Pixel( $DATA );
	$old = 'frames/frame' . $f . '.png';
	$f++;
	$f = sprintf( '%05d', $f ); //Convert back to string
	copy( $old, 'frames/frame' . $f . '.png' );

	$Image = new Image( 1200, 800 );
	$Image->image = imagecreatefrompng( 'frames/frame' . $f . '.png' );
	$Image->setColorFromHex( $Pixel->color );
	$x1 = ( $Pixel->x - $topLeftX ) * $pixelSize;
	$y1 = ( $Pixel->y - $topLeftY ) * $pixelSize;
	$x2 = $x1 + $pixelSize - 1;
	$y2 = $y1 + $pixelSize - 1;
	$Image->drawFilledRectangle( $x1, $y1, $x2, $y2 );
	$Image->save( 'frames/frame' . $f . '.png' );
	echo 'Frame ' . $f . ' created' . PHP_EOL;
}