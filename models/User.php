<?php

class User extends Model {

	/**
	 * The properties match the table columns
	 */
	public $id;
	public $facebook_id;
	public $join_time;
	public $last_seen;
	public $pixel_count;
	public $share_count;
	public $name;
	public $email;
	public $gender;
	public $locale;
	public $link;
	public $status;
	public $timezone;

	static function newFromId( $id ) {
		global $gDatabase;
		$Result = $gDatabase->query( "SELECT * FROM users WHERE id = $id LIMIT 1" );
		$DATA = $Result->fetch_assoc();
		if ( $DATA ) {
			return new User( $DATA );
		}
		throw new Exception( 'Not found', 404 );
	}

	static function newFromFacebookId( $facebook_id ) {
		global $gDatabase;
		$Result = $gDatabase->query( "SELECT * FROM users WHERE facebook_id = $facebook_id LIMIT 1" );
		$DATA = $Result->fetch_assoc();
		if ( $DATA ) {
			return new User( $DATA );
		}
		throw new Exception( 'Not found', 404 );
	}

	static function newFromName( $name ) {
		global $gDatabase;
		$name = $gDatabase->real_escape_string( $name );
		$Result = $gDatabase->query( "SELECT * FROM users WHERE name = '$name' LIMIT 1" ); // Careful! Two users may have the same name
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
		$token = $gDatabase->real_escape_string( $token );
		$Result = $gDatabase->query( "SELECT * FROM users WHERE token = '$token' LIMIT 1" );
		$DATA = $Result->fetch_assoc();
		if ( $DATA ) {
			return new User( $DATA );
		}
		throw new Exception( 'Not found', 404 );
	}

	function isAdmin() {
		if ( $this->status === 'admin' ) {
			return true;
		}
		return false;
	}

	function insert() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'INSERT INTO users (
			facebook_id,
			join_time,
			last_seen,
			pixel_count,
			share_count,
			token,
			name,
			email,
			gender,
			locale,
			link,
			status,
			timezone
			) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
		);
		$Statement->bind_param( 'siiiisssssssi',
			$this->facebook_id,
			$this->join_time,
			$this->last_seen,
			$this->pixel_count,
			$this->share_count,
			$this->token,
			$this->name,
			$this->email,
			$this->gender,
			$this->locale,
			$this->link,
			$this->status,
			$this->timezone
		);
		$Statement->execute();
		return $gDatabase->insert_id;
	}

	function update() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'UPDATE users SET
			facebook_id = ?,
			join_time = ?,
			last_seen = ?,
			pixel_count = ?,
			share_count = ?,
			token = ?,
			name = ?,
			email = ?,
			gender = ?,
			locale = ?,
			link = ?,
			status = ?,
			timezone = ?
			WHERE id = ?'
		);
		$Statement->bind_param( 'iiiissssssssii',
			$this->facebook_id,
			$this->join_time,
			$this->last_seen,
			$this->pixel_count,
			$this->share_count,
			$this->token,
			$this->name,
			$this->email,
			$this->gender,
			$this->locale,
			$this->link,
			$this->status,
			$this->timezone,
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