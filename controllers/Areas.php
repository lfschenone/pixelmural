<?php

class Areas extends Controller {

	static function GET() {
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

		switch ( $format ) {

			case 'base64':
				echo $Image->getBase64();
				break;

			case 'png':
				$Image->draw();
				break;
		}
	}

	static function POST() {
		global $gDatabase;

		$token = SESSION( 'token' );
		$User = User::newFromToken( $token );
		if ( !$User ) {
			throw new Error( 'Unauthorized', 401, $Pixel );
		}

		$AREADATA = POST( 'areaData' );
		$RESPONSE['oldAreaData'] = array();
		$RESPONSE['newAreaData'] = array();
		foreach ( $AREADATA as $DATA ) {

			$Pixel = Pixel::newFromCoords( $DATA['x'], $DATA['y'] );

			$RESPONSE['oldAreaData'][] = $Pixel->getData();

			if ( $User->canEdit( $Pixel ) ) {
				if ( $DATA['color'] ) {
					$Pixel->color = $DATA['color'];
					if ( $Pixel->author_id ) {
						$Pixel->update();
					} else {
						$Pixel->author_id = $User->id;
						$Pixel->insert();
					}
				} else {
					$Pixel->color = null;
					$Pixel->delete();
				}
			}

			$RESPONSE['newAreaData'][] = $Pixel->getData();
		}
		json( $RESPONSE );
	}
}