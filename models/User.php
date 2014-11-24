<?php

class User extends Model {

	/**
	 * The properties are identical to the database columns.
	 */
	public $id;
	public $facebook_id = null;
	public $join_time = null;
	public $last_seen = null;
	public $name = null;
	public $email = null;
	public $gender = null;
	public $locale = null;
	public $link = null;
	public $timezone = null;
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

	static function newFromName( $name ) {
		global $gDatabase;
		$Result = $gDatabase->query( "SELECT * FROM users WHERE name = '$name' LIMIT 1" );
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

	function insert() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'INSERT INTO users (
			join_time,
			last_seen,
			name,
			email,
			gender,
			locale,
			link,
			timezone,
			pixel_count
			) VALUES (?,?,?,?,?,?,?,?,?)'
		);
		$Statement->bind_param( 'iissssssi',
			$this->join_time,
			$this->last_seen,
			$this->name,
			$this->email,
			$this->gender,
			$this->locale,
			$this->link,
			$this->timezone,
			$this->pixel_count
		);
		$Statement->execute();
		return $gDatabase->insert_id;
	}

	function update() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'UPDATE users SET
			join_time = ?,
			last_seen = ?,
			name = ?,
			email = ?,
			gender = ?,
			locale = ?,
			link = ?,
			timezone = ?,
			pixel_count = ?
			WHERE id = ?'
		);
		$Statement->bind_param( 'iissssssii',
			$this->join_time,
			$this->last_seen,
			$this->name,
			$this->email,
			$this->gender,
			$this->locale,
			$this->link,
			$this->timezone,
			$this->pixel_count,
			$this->id
		);
		$Statement->execute();
		return true;
	}

	function delete() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'DELETE FROM users WHERE id = ? LIMIT 1' );
		$Statement->bind_param( 'i', $this->id );
		$Statement->execute();
	}
}