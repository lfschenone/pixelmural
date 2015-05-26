<?php

class Areas extends Controller {

	static function get() {
		global $gDatabase;

		$width = GET( 'width' );
		$height = GET( 'height' );
		$centerX = GET( 'centerX' );
		$centerY = GET( 'centerY' );
		$pixelSize = GET( 'pixelSize' );
		$format = GET( 'format' );

		$minX = $centerX - floor( $width / $pixelSize / 2 );
		$minY = $centerY - floor( $height / $pixelSize / 2 );
		$maxX = $centerX + ceil( $width / $pixelSize / 2 );
		$maxY = $centerY + ceil( $height / $pixelSize / 2 );

		$Image = new Image( $width, $height );
		$Image->makeTransparent();

		$Result = $gDatabase->query( "SELECT x, y, color FROM pixels WHERE x >= $minX AND x <= $maxX AND y >= $minY AND y <= $maxY" );
		while ( $DATA = $Result->fetch_assoc() ) {
			$Image->setColorFromHex( $DATA['color'] );
			$x1 = ( $DATA['x'] - $minX ) * $pixelSize;
			$y1 = ( $DATA['y'] - $minY ) * $pixelSize;
			$x2 = $x1 + $pixelSize - 1;
			$y2 = $y1 + $pixelSize - 1;
			$Image->drawFilledRectangle( $x1, $y1, $x2, $y2 );
		}
		if ( $format === 'base64' ) {
			return $Image->getBase64();
		}
		if ( $format === 'png' ) {
			$Image->draw();
			exit;
		}
	}

	static function post() {
		global $gUser, $gDatabase;

		$x = POST( 'x' );
		$y = POST( 'y' );
		$color = POST( 'color' );

		$firstPixel = Pixel::newFromCoords( $x, $y );

		if ( !$firstPixel ) {
			$RESPONSE['message'] = 'No pixel';
			return $RESPONSE;
		}

		if ( !$gUser->canEdit( $firstPixel ) ) {
			$RESPONSE['gUser'] = $gUser;
			$RESPONSE['Pixel'] = $firstPixel;
			$RESPONSE['Author'] = $firstPixel->getAuthor();
			$RESPONSE['message'] = 'Not your pixel';
			return $RESPONSE;
		}

		$oldAreaData[] = clone $firstPixel; // Save the data of the old pixels for the the undo/redo functionality
		$oldColor = $firstPixel->color;
		$firstPixel->color = $color;
		$firstPixel->update();
		$newAreaData[] = $firstPixel;
		$QUEUE[] = $firstPixel;

		while ( $QUEUE ) {
			$Pixel = array_shift( $QUEUE );

			// Search for all the pixels in the Von Neumann neighborhood that are owned by the user,
			// have the same color as the first pixel, and haven't been painted yet
			$Result = $gDatabase->query( 'SELECT * FROM pixels WHERE
				author_id = "' . $firstPixel->author_id . '" AND
				insert_time < ' . $_SERVER['REQUEST_TIME'] . ' AND
				color = "' . $oldColor . '" AND (
				( x = ' . $Pixel->x . ' + 1 AND y = ' . $Pixel->y . ' ) OR
				( x = ' . $Pixel->x . ' - 1 AND y = ' . $Pixel->y . ' ) OR
				( x = ' . $Pixel->x . ' AND y = ' . $Pixel->y . ' + 1 ) OR
				( x = ' . $Pixel->x . ' AND y = ' . $Pixel->y . ' - 1 )
				) LIMIT 4' );
			while ( $DATA = $Result->fetch_assoc() ) {
				$Neighbor = new Pixel( $DATA );
				$oldAreaData[] = clone $Neighbor;
				$Neighbor->color = $color;
				$Neighbor->update();
				$newAreaData[] = $Neighbor;
				$QUEUE[] = $Neighbor;
			}
		}
		$RESPONSE['message'] = 'Area painted';
		$RESPONSE['oldAreaData'] = $oldAreaData;
		$RESPONSE['newAreaData'] = $newAreaData;
		return $RESPONSE;
	}

	static function put() {
		// TO DO
	}

	static function delete() {
		// TO DO
	}
}