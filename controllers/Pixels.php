<?php

class Pixels extends Controller {

	static function get() {
		$x = GET( 'x' );
		$y = GET( 'y' );
		$Pixel = Pixel::newFromCoords( $x, $y );
		$RESPONSE['Pixel'] = $Pixel; // May be null
		if ( $Pixel ) {
			$Author = $Pixel->getAuthor();
			$RESPONSE['Author'] = $Author;
		}
		return $RESPONSE;
	}

	static function post() {
		global $gUser;

		$x = POST( 'x' );
		$y = POST( 'y' );
		$color = POST( 'color' );
		$tool = POST( 'tool' );

		$Pixel = Pixel::newFromCoords( $x, $y );

		if ( $tool === 'brush' and in_array( 'brush', $gUser->tools ) ) {
			$RESPONSE['Pixel'] = $Pixel;
			$RESPONSE['message'] = "You don't have the brush";
			return $RESPONSE;
		}

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
			$RESPONSE['message'] = 'Pixel saved';
			$gUser->pixel_count++;
			$gUser->update();
		}
		$RESPONSE['Pixel'] = $Pixel;
		return $RESPONSE;
	}

	static function put() {
		// TO DO
	}

	static function delete() {
		// TO DO
	}
}