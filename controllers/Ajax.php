<?php

class Ajax extends Controller {

	static function getPixels() {
		global $gDatabase;
		$PIXELS = array();
		$Result = $gDatabase->query( 'SELECT * FROM pixels' );
		while ( $DATA = $Result->fetch_assoc() ) {
			$PIXELS[] = new Pixel( $DATA );
		}
		exit( json_encode( $PIXELS ) );
	}

	static function drawPixel() {
		$x = GET( 'x' );
		$y = GET( 'y' );
		$ip = $_SERVER['REMOTE_ADDR'];
		$time = $_SERVER['REQUEST_TIME'];
		$color = '#' . GET( 'color' );

		$Pixel = Pixel::newFromCoords( $x, $y );
		if ( $Pixel ) {
			if ( $Pixel->ip == $ip ) {
				if ( $Pixel->color == $color ) {
					$Pixel->delete();
					exit( 'Pixel deleted' );
				} else {
					$Pixel->color = $color;
					$Pixel->update();
					exit( 'Pixel updated' );
				}
			} else {
				exit( 'Not your pixel' );
			}
		} else {
			$Pixel = new Pixel;
			$Pixel->x = $x;
			$Pixel->y = $y;
			$Pixel->ip = $ip;
			$Pixel->time = $time;
			$Pixel->color = $color;
			$Pixel->insert();
			exit( 'Pixel inserted' );
		}
	}

	static function paintArea() {
		global $gDatabase;

		$x = GET( 'x' );
		$y = GET( 'y' );
		$ip = $_SERVER['REMOTE_ADDR'];
		$time = $_SERVER['REQUEST_TIME'];
		$color = '#' . GET( 'color' );

		$firstPixel = Pixel::newFromCoords( $x, $y );

		if ( !$firstPixel ) {
			$Pixel = new Pixel;
			$Pixel->x = $x;
			$Pixel->y = $y;
			$Pixel->ip = $ip;
			$Pixel->time = $time;
			$Pixel->color = $color;
			$Pixel->insert();
			exit( 'Pixel inserted' );
		}

		if ( $firstPixel->ip != $ip ) {
			exit( 'Not your pixel' );
		}

		if ( $firstPixel->color == $color ) {
			$firstPixel->delete();
			exit( 'Pixel deleted' );
		}

		$oldColor = $firstPixel->color;
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
		exit( json_encode( $PAINTED ) );
	}

	static function clearPixel() {
		$x = GET( 'x' );
		$y = GET( 'y' );
		$Pixel = Pixel::newFromCoords( $x, $y );
		if ( $Pixel ) {
			$Pixel->delete();
			exit( 'Pixel deleted' );
		} else {
			exit( 'Pixel not found' );
		}
	}
}