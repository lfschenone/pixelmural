<?php

class Tokens extends Controller {

	static function get() {
		global $gUser;

		Facebook\FacebookSession::setDefaultApplication( FACEBOOK_APP_ID, FACEBOOK_APP_SECRET );
		$Helper = new Facebook\FacebookJavaScriptLoginHelper();
		try {
			$Session = $Helper->getSession();
		} catch( Facebook\FacebookRequestException $FacebookRequestException ) {
			error_log( $FacebookRequestException->getMessage() );
		} catch( Exception $Exception ) {
			error_log( $Exception->getMessage() );
		}

		if ( $Session ) {
			$FacebookRequest = new Facebook\FacebookRequest( $Session, 'GET', '/me' );
			$GraphUser = $FacebookRequest->execute()->getGraphObject( Facebook\GraphUser::className() );
			$gUser = User::newFromFacebookId( $GraphUser->getProperty( 'id' ) );

			// If no user matches the Facebook id, create one
			if ( !$gUser ) {
				$gUser = new User;
				$gUser->status = 'user';
				$gUser->insert();
			}

			// Update the data
			$DATA = $GraphUser->asArray();
			foreach ( $DATA as $key => $value ) {
				if ( property_exists( 'User', $key ) and $key !== 'id' ) {
					$gUser->$key = $value;
				}
			}
			$gUser->facebook_id = $DATA['id']; // Because we already have an 'id' field

		} else {

			$ip = $_SERVER['REMOTE_ADDR'];
			$gUser = User::newFromIp( $ip );
			if ( !$gUser ) {
				$gUser = new User;
				$gUser->name = $ip; // IPs are the names of anonymous users
				$gUser->status = 'anon';
				$gUser->insert();
			}
		}

		// Create the token
		$token = md5( uniqid() );
		$gUser->token = $token;
		$gUser->update();
		$_SESSION['token'] = $token;

		return $gUser;
	}

	static function post() {
		// TO DO
	}

	static function put() {
		// TO DO
	}

	static function delete() {
		// TO DO
	}
}