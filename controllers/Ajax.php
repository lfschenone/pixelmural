<?php

class Ajax extends Controller {

	static function getPixel() {
		$x = GET( 'x' );
		$y = GET( 'y' );
		$Pixel = Pixel::newFromCoords( $x, $y );
		self::sendResponse( $Pixel );
	}

	static function getInfo() {
		$x = GET( 'x' );
		$y = GET( 'y' );

		$Pixel = Pixel::newFromCoords( $x, $y );
		$RESPONSE['Pixel'] = $Pixel;
		if ( $Pixel ) {
			$Author = $Pixel->getAuthor();
			$RESPONSE['Author'] = $Author;
		}
		self::sendResponse( $RESPONSE );
	}

	static function getArea() {
		global $gDatabase;
		$topLeftX = GET( 'topLeftX' );
		$topLeftY = GET( 'topLeftY' );
		$xPixels = GET( 'xPixels' );
		$yPixels = GET( 'yPixels' );
		$pixelSize = GET( 'pixelSize' );

		$pixels = '';
		$Result = $gDatabase->query( "SELECT x, y, color FROM pixels WHERE x >= $topLeftX AND x <= ( $topLeftX + $xPixels ) AND y >= $topLeftY AND y <= ( $topLeftY + $yPixels )" );
		while ( $DATA = $Result->fetch_assoc() ) {
			$pixels .= $DATA['x'] . ',' . $DATA['y'] . ',' . $DATA['color'] . ';';
		}

		self::sendResponse( $pixels );
	}

	static function saveScreen() {
		$topLeftX = GET( 'topLeftX' );
		$topLeftY = GET( 'topLeftY' );
		$xPixels = GET( 'xPixels' );
		$yPixels = GET( 'yPixels' );
		$pixelSize = GET( 'pixelSize' );

		Board::saveScreen( $topLeftX, $topLeftY, $xPixels, $yPixels, $pixelSize );

		self::sendResponse();
	}

	static function savePixel() {
		global $gUser;

		$x = GET( 'x' );
		$y = GET( 'y' );
		$author_id = $gUser->id;
		$time = $_SERVER['REQUEST_TIME'];
		$color = GET( 'color' );

		$Pixel = Pixel::newFromCoords( $x, $y );
		if ( !$Pixel ) {
			$Pixel = new Pixel;
			$Pixel->x = $x;
			$Pixel->y = $y;
			$Pixel->author_id = $author_id;
			$Pixel->time = $time;
			$Pixel->color = $color;
			$Pixel->insert();
			$RESPONSE['message'] = 'Pixel inserted';
		} else if ( $Pixel->author_id != $author_id and !$gUser->isAdmin() ) {
			$RESPONSE['message'] = 'Not your pixel';
		} else if ( !$color ) {
			$Pixel->delete();
			$RESPONSE['message'] = 'Pixel deleted';
		} else {
			$Pixel->color = $color;
			$Pixel->update();
			$RESPONSE['message'] = 'Pixel updated';
		}
		$RESPONSE['Pixel'] = $Pixel;
		self::sendResponse( $RESPONSE );
	}

	static function paintArea() {
		global $gUser, $gDatabase;

		$x = GET( 'x' );
		$y = GET( 'y' );
		$author_id = $gUser->id;
		$time = $_SERVER['REQUEST_TIME'];
		$color = GET( 'color' );

		$firstPixel = Pixel::newFromCoords( $x, $y );
		if ( !$firstPixel ) {
			$RESPONSE['message'] = 'Not your pixel';
		} else if ( $firstPixel->author_id != $author_id and !$gUser->isAdmin() ) {
			$RESPONSE['message'] = 'Not your pixel';
		} else {
			$oldColor = $firstPixel->color;
			$firstPixel->time = $time;
			$firstPixel->color = $color;
			$firstPixel->update();
			$PAINTED = array( $firstPixel );
			$QUEUE = array( $firstPixel );

			while ( $QUEUE ) {
				$Pixel = array_shift( $QUEUE );

				// Search for all the pixels in the Von Neumann neighborhood that are owned by the user,
				// have the same color as the first pixel, and haven't been painted yet
				$Result = $gDatabase->query( 'SELECT * FROM pixels WHERE
					author_id = "' . $author_id . '" AND
					time < ' . $time . ' AND
					color = "' . $oldColor . '" AND (
					( x = ' . $Pixel->x . ' + 1 AND y = ' . $Pixel->y . ' ) OR
					( x = ' . $Pixel->x . ' - 1 AND y = ' . $Pixel->y . ' ) OR
					( x = ' . $Pixel->x . ' AND y = ' . $Pixel->y . ' + 1 ) OR
					( x = ' . $Pixel->x . ' AND y = ' . $Pixel->y . ' - 1 )
					) LIMIT 4' );
				while ( $DATA = $Result->fetch_assoc() ) {
					$Neighbor = new Pixel( $DATA );
					$Neighbor->time = $time;
					$Neighbor->color = $color;
					$Neighbor->update();
					$PAINTED[] = $Neighbor;
					$QUEUE[] = $Neighbor;
				}
			}
			$RESPONSE['message'] = 'Area painted';
			$RESPONSE['PIXELS'] = $PAINTED;
		}
		self::sendResponse( $RESPONSE );
	}

	static function sendResponse( $RESPONSE ) {
		header( 'Content-Type: application/json' );
		echo json_encode( $RESPONSE );
	}
}