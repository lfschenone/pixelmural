<?php

class User extends Controller {

	static function login() {
		global $gDatabase;
		$x = GET( 'x' );
		$y = GET( 'y' );
		$Pixel = Pixel::newFromCoords( $x, $y );
		exit( json_encode( $Pixel ) );
	}
}