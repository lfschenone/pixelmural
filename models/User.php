<?php

class User extends Model {

	/**
	 * The properties are identical to the database columns.
	 */
	public $id;
	public $facebook_id;
	public $join_time;
	public $last_seen;
	public $name;
	public $email;
	public $gender;
	public $locale;
	public $link;
	public $timezone;
	public $pixel_count = 0;

	static function newFromId( $id ) {
		global $gDatabase;
		$Result = $gDatabase->query( "SELECT * FROM users WHERE id = $id LIMIT 1" );
		$DATA = $Result->fetch_assoc();
		if ( $DATA ) {
			return new User( $DATA );
		}
		throw new Exception( 'Not found', 404 );
	}

	static function newFromUsername( $username ) {
		global $gDatabase;
		$Result = $gDatabase->query( "SELECT * FROM users WHERE username = '$username' LIMIT 1" );
		$DATA = $Result->fetch_assoc();
		if ( $DATA ) {
			return new User( $DATA );
		}
		throw new Exception( 'Not found', 404 );
	}

	static function newFromToken( $token ) {
		global $gDatabase;
		if ( !$token ) {
			throw new Exception( 'Bad request', 400 );
		}
		$Result = $gDatabase->query( "SELECT * FROM users WHERE token = '$token' LIMIT 1" );
		$DATA = $Result->fetch_assoc();
		if ( $DATA ) {
			return new User( $DATA );
		}
		throw new Exception( 'Not found', 404 );
	}

	static function newFromFacebook() {
		global $gDatabase;

		$Helper = new Facebook\FacebookJavaScriptLoginHelper();
		try {
			$Session = $Helper->getSession();
			$FacebookRequest = new Facebook\FacebookRequest( $Session, 'GET', '/me' );
			$GraphUser = $FacebookRequest->execute()->getGraphObject( Facebook\GraphUser::className() );
			$DATA = $GraphUser->asArray();
			foreach ( $DATA as $key => $value ) {
				if ( property_exists( 'User', $key ) ) {
					$this->$key = $value;
				}
			}
			$Response = $this;
		} catch( Facebook\FacebookRequestException $Exception ) {
			$Response = array( 'message' => 2, 'exception' => $Exception );
		} catch( Exception $Exception ) {
			$Response = array( 'message' => 3, 'exception' => $Exception );
		}
		pr( $Response );
		exit;
	}
}