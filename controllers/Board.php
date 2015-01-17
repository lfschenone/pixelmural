<?php

class Board extends Controller {

	static function view() {
		global $topLeftX, $topLeftY, $pixelSize;
		$xPixels = floor( 1200 / $pixelSize );
		$yPixels = floor( 800 / $pixelSize );
		self::saveScreen( $topLeftX, $topLeftY, $xPixels, $yPixels, $pixelSize );
		include 'views/board.php';
	}

	static function saveScreen( $topLeftX, $topLeftY, $xPixels, $yPixels, $pixelSize ) {
		global $gDatabase;

		// Create a grey image
		$Image = new Image( $xPixels * $pixelSize, $yPixels * $pixelSize );
		$Image->setColorFromHex( '#aaaaaa' );
		$Image->fill();

		$PIXELS = array();
		$Result = $gDatabase->query( "SELECT * FROM pixels WHERE x >= $topLeftX AND x <= ( $topLeftX + $xPixels ) AND y >= $topLeftY AND y <= ( $topLeftY + $yPixels )" );
		while ( $DATA = $Result->fetch_assoc() ) {
			$Pixel = new Pixel( $DATA );
			$Image->setColorFromHex( $Pixel->color );
			$x1 = ( $Pixel->x - $topLeftX ) * $pixelSize;
			$y1 = ( $Pixel->y - $topLeftY ) * $pixelSize;
			$x2 = $x1 + $pixelSize - 1;
			$y2 = $y1 + $pixelSize - 1;
			$Image->drawFilledRectangle( $x1, $y1, $x2, $y2 );
		}
		$Image->save( 'screens/' . $topLeftX . ',' . $topLeftY . ',' . $pixelSize . '.png' );
	}
}