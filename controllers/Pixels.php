<?php

class Pixels extends Controller {

	static function GET() {

		$x = GET( 'x' );
		$y = GET( 'y' );

		$Pixel = Pixel::newFromCoords( $x, $y );
		$RESPONSE['Pixel'] = $Pixel; // May be null

		if ( $Pixel ) {
			$Author = $Pixel->getAuthor();
			$RESPONSE['Author'] = $Author;
		}

		json( $RESPONSE );
	}

	static function POST() {

		$x = POST( 'x' );
		$y = POST( 'y' );
		$color = POST( 'color' );
		$tool = POST( 'tool' );

		$Pixel = Pixel::newFromCoords( $x, $y ); // May be null

		$token = SESSION( 'token' );
		$User = User::newFromToken( $token );
		if ( !$User ) {
			throw new Error( 'Unauthorized', 401, $Pixel );
		}

		if ( $tool === 'brush' and $User->isAnon() ) {
			throw new Error( 'Unauthorized', 401, $Pixel );
		}

		if ( $Pixel and !$User->canEdit( $Pixel ) ) {
			throw new Error( 'Forbidden', 403, $Pixel );
		}

		if ( $Pixel and $color ) {
			$Pixel->color = $color;
			$Pixel->update();
		}

		if ( $Pixel and !$color ) {
			$Pixel->delete();
		}

		if ( !$Pixel and $color ) {
			$Pixel = new Pixel;
			$Pixel->x = $x;
			$Pixel->y = $y;
			$Pixel->author_id = $User->id;
			$Pixel->color = $color;
			$Pixel->insert();
		}
	}
}