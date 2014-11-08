<?php

class Ajax extends Controller {

	static function getPixel() {
		global $gDatabase;
		$x = GET( 'x' );
		$y = GET( 'y' );
		$Pixel = Pixel::newFromCoords( $x, $y );
		self::sendResponse( $Pixel );
	}

	static function getArea() {
		global $gDatabase;
		$x = GET( 'x' );
		$y = GET( 'y' );
		$width = GET( 'width' );
		$height = GET( 'height' );

		$PIXELS = array();
		$Result = $gDatabase->query( "SELECT * FROM pixels WHERE x >= $x AND x <= ( $x + $width ) AND y >= $y AND y <= ( $y + $height )" );
		while ( $DATA = $Result->fetch_assoc() ) {
			$PIXELS[] = new Pixel( $DATA );
		}
		self::sendResponse( $PIXELS );
	}

	static function savePixel() {
		global $gDatabase;

		$x = GET( 'x' );
		$y = GET( 'y' );
		$ip = $_SERVER['REMOTE_ADDR'];
		$time = $_SERVER['REQUEST_TIME'];
		$color = GET( 'color' );

		$Pixel = Pixel::newFromCoords( $x, $y );
		if ( !$Pixel ) {
			$Pixel = new Pixel;
			$Pixel->x = $x;
			$Pixel->y = $y;
			$Pixel->ip = $ip;
			$Pixel->time = $time;
			$Pixel->color = $color;
			$Pixel->insert();
			$RESPONSE['message'] = 'Pixel inserted';
		} else if ( $Pixel->ip != $ip ) {
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
		global $gDatabase;

		$x = GET( 'x' );
		$y = GET( 'y' );
		$ip = $_SERVER['REMOTE_ADDR'];
		$time = $_SERVER['REQUEST_TIME'];
		$color = GET( 'color' );

		$firstPixel = Pixel::newFromCoords( $x, $y );
		if ( !$firstPixel ) {
			$RESPONSE['message'] = 'The background changed only for you';
		} else if ( $firstPixel->ip != $ip ) {
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

				//Search for all the pixels in the Von Neumann neighborhood that are owned by the user,
				//have the same color as the first pixel, and haven't been painted yet
				$Result = $gDatabase->query( 'SELECT * FROM pixels WHERE
					ip = "' . $ip . '" AND
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

	static function sendResponse( $response ) {
		header( 'Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type' );
		header( 'Access-Control-Allow-Origin: *' );
		header( 'Content-Type: application/json' );
		echo json_encode( $response );
		exit;
	}
}