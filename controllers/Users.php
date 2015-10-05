<?php

class Users extends Controller {

	static function GET() {
		$token = SESSION( 'token' );
		$User = User::newFromToken( $token );
		json( $User );
	}

	static function POST() {
		$token = SESSION( 'token' );
		$User = User::newFromToken( $token );
		foreach ( $_POST as $key => $value ) {
			$User->$key = $value;
		}
		$User->normalise();
		$User->validate();
		$User->update();
		json( $User );
	}
}