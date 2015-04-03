<?php

class Ajax extends Controller {

	static function fetchPixel() {
		$x = GET( 'x' );
		$y = GET( 'y' );
		$Pixel = Pixel::newFromCoords( $x, $y );
		return $Pixel; // May be null
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
		return $RESPONSE;
	}

	static function getArea() {
		global $gDatabase;
		$x1 = GET( 'x1' );
		$y1 = GET( 'y1' );
		$x2 = GET( 'x2' );
		$y2 = GET( 'y2' );

		$PIXELS = array();
		$Result = $gDatabase->query( "SELECT x, y, color FROM pixels WHERE x >= $x1 AND x <= $x2 AND y >= $y1 AND y <= $y2" );
		while ( $DATA = $Result->fetch_assoc() ) {
			$PIXELS[] = (int) $DATA['x'];
			$PIXELS[] = (int) $DATA['y'];
			$PIXELS[] = $DATA['color'];
		}
		return $PIXELS;
	}

	/**
	 * Saves a screenshot of 1200px x 630px (recommended image size by Facebook)
	 * centered around the view of the user
	 */
	static function saveScreen() {
		global $gDatabase;

		$centerX = GET( 'centerX' );
		$centerY = GET( 'centerY' );
		$pixelSize = GET( 'pixelSize' );

		// Calculate the rest of the screenshot details
		$width = 1200;
		$height = 630;
		$xPixels = ceil( $width / $pixelSize );
		$yPixels = ceil( $height / $pixelSize );
		$x1 = $centerX - $xPixels / 2; // ceil() or floor() ?
		$y1 = $centerY - $yPixels / 2;
		$x2 = $centerX + $xPixels / 2;
		$y2 = $centerY + $yPixels / 2;

		// Create a transparent image
		$Image = new Image( $width, $height );
		$Image->makeTransparent();

		// Fill the image with the pixels
		$Result = $gDatabase->query( "SELECT * FROM pixels WHERE x >= $x1 AND x <= $x2 AND y >= $y1 AND y <= $y2" );
		while ( $DATA = $Result->fetch_assoc() ) {
			$Pixel = new Pixel( $DATA );
			$x1 = abs( $centerX - floor( $xPixels / 2 ) - $Pixel->x ) * $pixelSize;
			$y1 = abs( $centerY - floor( $yPixels / 2 ) - $Pixel->y ) * $pixelSize;
			$x2 = $x1 + $pixelSize;
			$y2 = $y1 + $pixelSize;
			$Image->setColorFromHex( $Pixel->color );
			$Image->drawFilledRectangle( $x1, $y1, $x2, $y2 );
		}
		if ( !file_exists( 'screens/' . $centerX ) ) {
			mkdir( 'screens/' . $centerX );
		}
		if ( !file_exists( 'screens/' . $centerX . '/' . $centerY ) ) {
			mkdir( 'screens/' . $centerX . '/' . $centerY );
		}
		$Image->save( 'screens/' . $centerX . '/' . $centerY . '/' . $pixelSize . '.png' );
		return null;
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
					$RESPONSE['message'] = 'Pixel updated';
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
		return $RESPONSE;
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
		return $RESPONSE;
	}

	static function facebookLogin() {
		global $gDatabase, $gUser;

		$Helper = new Facebook\FacebookJavaScriptLoginHelper();
		try {
			$Session = $Helper->getSession();
			$FacebookRequest = new Facebook\FacebookRequest( $Session, 'GET', '/me' );
			$GraphUser = $FacebookRequest->execute()->getGraphObject( Facebook\GraphUser::className() );
			$RESPONSE['GraphUser'] = $GraphUser->asArray();

			$gUser = User::newFromFacebookId( $GraphUser->getProperty( 'id' ) );

			// If no user matches that Facebook id, create one
			if ( !$gUser ) {
				$gUser = new User;
				$gUser->join_time = $_SERVER['REQUEST_TIME'];
				$gUser->status = 'user';
				$gUser->id = $gUser->insert();
			}

			// Set the token
			$gUser->token = md5( uniqid() );
			$_SESSION['token'] = $gUser->token;
			setcookie( 'token', $gUser->token, time() + 60 * 60 * 24 * 30, '/' ); //Lasts one month

			// Every time the user logs in, make sure all the stats are up to date
			$DATA = $GraphUser->asArray();
			foreach ( $DATA as $key => $value ) {
				if ( property_exists( 'User', $key ) and $key !== 'id' ) {
					$gUser->$key = $value;
				}
			}
			$gUser->facebook_id = $DATA['id']; // Because we already have an 'id' field -_-
			$gUser->last_seen = $_SERVER['REQUEST_TIME'];
			$gUser->update();

			$RESPONSE['user'] = $gUser;

		} catch( Facebook\FacebookRequestException $FacebookRequestException ) {
			$RESPONSE = array( 'code' => $FacebookRequestException->getCode(), 'message' => $FacebookRequestException->getMessage() );
		} catch( Exception $Exception ) {
			$RESPONSE = array( 'code' => $Exception->getCode(), 'message' => $Exception->getMessage() );
		}
		return $RESPONSE;
	}

	static function facebookLogout() {
		global $gDatabase, $gUser;
		session_destroy();
		setcookie( 'token', '', 0, '/' );

		// Now update the user info
		$name = $_SERVER['REMOTE_ADDR']; // IPs are treated as names of anonymous users
		$gUser = User::newFromName( $name );
		
		// If no user exists with that name, create a new one
		if ( !$gUser ) {
			$gUser = new User;
			$gUser->name = $_SERVER['REMOTE_ADDR'];
			$gUser->join_time = $_SERVER['REQUEST_TIME'];
			$gUser->status = 'anon';
			$gUser->id = $gUser->insert();
		}
		$RESPONSE['user'] = $gUser;
		return $RESPONSE;
	}
}