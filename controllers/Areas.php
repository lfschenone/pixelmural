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

		$Statement = $gDatabase->prepare( 'SELECT x, y, color FROM pixels WHERE x >= ? AND x <= ? AND y >= ? AND y <= ?' );
		$Statement->bind_param( 'iiii', $minX, $maxX, $minY, $maxY );
		$Statement->execute();
		$Statement->bind_result( $x, $y, $color );
		while ( $Statement->fetch() ) {
			$Image->setColorFromHex( $color );
			$x1 = ( $x - $minX ) * $pixelSize;
			$y1 = ( $y - $minY ) * $pixelSize;
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
			$Statement = $gDatabase->prepare( 'SELECT * FROM pixels WHERE
				author_id = ? AND
				insert_time < ? AND
				color = ? AND (
				( x = ? + 1 AND y = ? ) OR
				( x = ? - 1 AND y = ? ) OR
				( x = ? AND y = ? + 1 ) OR
				( x = ? AND y = ? - 1 )
				) LIMIT 4'
			);
			$Statement->bind_param( 'iisiiiiiiii',
				$firstPixel->author_id,
				$_SERVER['REQUEST_TIME'],
				$oldColor,
				$Pixel->x,
				$Pixel->y,
				$Pixel->x,
				$Pixel->y,
				$Pixel->x,
				$Pixel->y,
				$Pixel->x,
				$Pixel->y
			);
			$Statement->execute();
			$RESULT = get_result( $Statement );
			while ( $DATA = array_shift( $RESULT ) ) {
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