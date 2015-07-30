<?php

class Users extends Controller {

	static function GET() {
		$token = GET( 'token' );
		$User = User::newFromToken( $token );
		json( $User );
	}

	static function POST() {
		$User = new User( $_POST );
		$User->update();
		json( $User );
	}
}