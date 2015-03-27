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

	/**
	 * Saves a screenshot of 1200px x 630px (recommended image size by Facebook),
	 * centered around the view that the requesting user currently has
	 */
	static function saveScreen() {
		global $gDatabase;

		// These values describe the view of the current user
		$topLeftX = GET( 'topLeftX' );
		$topLeftY = GET( 'topLeftY' );
		$xPixels = GET( 'xPixels' );
		$yPixels = GET( 'yPixels' );
		$pixelSize = GET( 'pixelSize' );

		// Now we must calculate the details of the screenshot
		$width = 1200;
		$height = 630;
		$xPixels = ceil( $width / $pixelSize );
		$yPixels = ceil( $height / $pixelSize );

		// Create a white image
		$Image = new Image( $width, $height );
		$Image->setColorFromHex( '#ffffff' );
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
		if ( !file_exists( 'screens/' . $topLeftX ) ) {
			mkdir( 'screens/' . $topLeftX );
		}
		if ( !file_exists( 'screens/' . $topLeftX . '/' . $topLeftY ) ) {
			mkdir( 'screens/' . $topLeftX . '/' . $topLeftY );
		}
		$Image->save( 'screens/' . $topLeftX . '/' . $topLeftY . '/' . $pixelSize . '.png' );
		self::sendResponse();
	}

	static function savePixel() {
		global $gUser;

		$x = GET( 'x' );
		$y = GET( 'y' );
		$color = GET( 'color' );

		$Pixel = Pixel::newFromCoords( $x, $y );

		if ( $Pixel ) {
			if ( $gUser->canEdit( $Pixel ) ) {
				if ( $color ) {
					$Pixel->color = $color;
					$Pixel->update();
					$RESPONSE['message'] = 'Pixel updated' . $gUser->id . ' vs ' . $Pixel->author_id;
				} else {
					$Pixel->delete();
					$RESPONSE['message'] = 'Pixel deleted';
				}
			} else {
				$RESPONSE['Author'] = $Pixel->getAuthor();
				$RESPONSE['message'] = 'Not your pixel';
			}
		} else if ( $color ) {
			$Pixel = new Pixel;
			$Pixel->x = $x;
			$Pixel->y = $y;
			$Pixel->author_id = $gUser->id;
			$Pixel->time = time();
			$Pixel->color = $color;
			$Pixel->insert();
			$RESPONSE['message'] = 'Pixel inserted';
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
			$oldData[] = clone $firstPixel; // Save the data of the old pixels for the the undo/redo functionality
			$oldColor = $firstPixel->color;
			$firstPixel->color = $color;
			$firstPixel->update();
			$newData = array( $firstPixel );
			$QUEUE = array( $firstPixel );

			while ( $QUEUE ) {
				$Pixel = array_shift( $QUEUE );

				// Search for all the pixels in the Von Neumann neighborhood that are owned by the user,
				// have the same color as the first pixel, and haven't been painted yet
				$Result = $gDatabase->query( 'SELECT * FROM pixels WHERE
					author_id = "' . $firstPixel->author_id . '" AND
					time < ' . $time . ' AND
					color = "' . $oldColor . '" AND (
					( x = ' . $Pixel->x . ' + 1 AND y = ' . $Pixel->y . ' ) OR
					( x = ' . $Pixel->x . ' - 1 AND y = ' . $Pixel->y . ' ) OR
					( x = ' . $Pixel->x . ' AND y = ' . $Pixel->y . ' + 1 ) OR
					( x = ' . $Pixel->x . ' AND y = ' . $Pixel->y . ' - 1 )
					) LIMIT 4' );
				while ( $DATA = $Result->fetch_assoc() ) {
					$Neighbor = new Pixel( $DATA );
					$oldData[] = clone $Neighbor;
					$Neighbor->color = $color;
					$Neighbor->update();
					$newData[] = $Neighbor;
					$QUEUE[] = $Neighbor;
				}
			}
			$RESPONSE['message'] = 'Area painted';
			$RESPONSE['oldData'] = $oldData;
			$RESPONSE['newData'] = $newData;
		}
		self::sendResponse( $RESPONSE );
	}

	static function sendResponse( $RESPONSE = null ) {
		header( 'Content-Type: application/json' );
		echo json_encode( $RESPONSE );
	}
}