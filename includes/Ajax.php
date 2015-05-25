<?php

class Ajax {

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
			$PIXELS[] = $DATA['x'];
			$PIXELS[] = $DATA['y'];
			$PIXELS[] = $DATA['color'];
		}
		return $PIXELS;
	}

	static function getBoard() {
		global $gDatabase;

		$width = GET( 'width' );
		$height = GET( 'height' );
		$pixelSize = GET( 'pixelSize' );
		$centerX = GET( 'centerX' );
		$centerY = GET( 'centerY' );

		$Image = new Image( $width, $height );
		$Image->makeTransparent();

		$minX = $centerX - floor( $width / $pixelSize / 2 );
		$minY = $centerY - floor( $height / $pixelSize / 2 );
		$maxX = $centerX + floor( $width / $pixelSize / 2 );
		$maxY = $centerY + floor( $height / $pixelSize / 2 );

		$Result = $gDatabase->query( "SELECT x, y, color FROM pixels WHERE x >= $minX AND x <= $maxX AND y >= $minY AND y <= $maxY" );
		while ( $DATA = $Result->fetch_assoc() ) {
			$Image->setColorFromHex( $DATA['color'] );
			$x1 = ( $DATA['x'] - $minX ) * $pixelSize;
			$y1 = ( $DATA['y'] - $minY ) * $pixelSize;
			$x2 = $x1 + $pixelSize - 1;
			$y2 = $y1 + $pixelSize - 1;
			$Image->drawFilledRectangle( $x1, $y1, $x2, $y2 );
		}
		return $Image->getBase64();
	}

	static function savePixel() {
		global $gUser;

		$x = POST( 'x' );
		$y = POST( 'y' );
		$color = POST( 'color' );

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
					$Author = $Pixel->getAuthor();
					$Author->pixel_count--;
					$Author->update();
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
			$Pixel->color = $color;
			$Pixel->insert();
			$RESPONSE['message'] = 'Pixel inserted';
			$gUser->pixel_count++;
			$gUser->update();
		}
		$RESPONSE['Pixel'] = $Pixel;
		return $RESPONSE;
	}

	static function paintArea() {
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

	static function facebookLogin() {
		global $gDatabase, $gUser;

		Facebook\FacebookSession::setDefaultApplication( FACEBOOK_APP_ID, FACEBOOK_APP_SECRET );
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
				$gUser->status = 'user';
				$gUser->insert();
			}

			// Set the token
			$gUser->token = md5( uniqid() );
			$_SESSION['token'] = $gUser->token;
			setcookie( 'token', $gUser->token, $_SERVER['REQUEST_TIME'] + 60 * 60 * 24 * 30, '/' ); // 30 days

			// Every time the user logs in, make sure all the stats are up to date
			$DATA = $GraphUser->asArray();
			foreach ( $DATA as $key => $value ) {
				if ( property_exists( 'User', $key ) and $key !== 'id' ) {
					$gUser->$key = $value;
				}
			}
			$gUser->facebook_id = $DATA['id']; // Because we already have an 'id' field
			$gUser->update();

			$RESPONSE['gUser'] = $gUser;

		} catch( Facebook\FacebookRequestException $FacebookRequestException ) {
			$RESPONSE = array( 'code' => $FacebookRequestException->getCode(), 'message' => $FacebookRequestException->getMessage() );
		} catch( Exception $Exception ) {
			$RESPONSE = array( 'code' => $Exception->getCode(), 'message' => $Exception->getMessage() );
		}
		return $RESPONSE;
	}

	static function facebookLogout() {
		global $gUser;

		session_destroy();
		setcookie( 'token', '', 0, '/' );

		// Update the global user
		$ip = $_SERVER['REMOTE_ADDR'];
		$gUser = User::newFromIp( $ip );

		$RESPONSE['gUser'] = $gUser;
		return $RESPONSE;
	}

	static function facebookShare() {
		global $gUser;

		$gUser->share_count++;
		$gUser->update();

		$RESPONSE['gUser'] = $gUser;
		return $gUser;
	}

	/**
	 * Outputs a screenshot centered around the view of the user, meant to be shared on Facebook
	 */
	static function facebookPreview() {
		global $gDatabase;

		$centerX = GET( 'centerX' );
		$centerY = GET( 'centerY' );
		$pixelSize = GET( 'pixelSize' );

		// Calculate the rest of the screenshot details
		$width = 1200; // Recommended image size
		$height = 630; // for sharing on Facebook
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
		// Output the image
		$Image->draw();
	}
}