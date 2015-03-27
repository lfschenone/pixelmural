<?php

class Users extends Controller {

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

			$RESPONSE['gUser'] = $gUser;

		} catch( Facebook\FacebookRequestException $FacebookRequestException ) {
			$RESPONSE = array( 'code' => $FacebookRequestException->getCode(), 'message' => $FacebookRequestException->getMessage() );
		} catch( Exception $Exception ) {
			$RESPONSE = array( 'code' => $Exception->getCode(), 'message' => $Exception->getMessage() );
		}
		Ajax::sendResponse( $RESPONSE );
	}

	static function facebookLogout() {
		global $gDatabase, $gUser;
		session_destroy();
		setcookie( 'token', '', 0, '/' );
	}
}