<?php

class User extends Model {

	/**
	 * The properties match the table columns
	 */
	public $id;
	public $facebook_id;
	public $insert_time;
	public $update_time;
	public $pixel_count = 0;
	public $share_count = 0;
	public $name;
	public $email;
	public $gender;
	public $locale;
	public $link;
	public $status;
	public $timezone;

	static function newFromId( $id ) {
		global $gDatabase;
		if ( !$id ) {
			return;
		}
		$Result = $gDatabase->query( "SELECT * FROM users WHERE id = $id LIMIT 1" );
		$DATA = $Result->fetch_assoc();
		if ( $DATA ) {
			return new User( $DATA );
		}
	}

	static function newFromFacebookId( $facebook_id ) {
		global $gDatabase;
		if ( !$facebook_id ) {
			return;
		}
		$Result = $gDatabase->query( "SELECT * FROM users WHERE facebook_id = $facebook_id LIMIT 1" );
		$DATA = $Result->fetch_assoc();
		if ( $DATA ) {
			return new User( $DATA );
		}
	}

	static function newFromIp( $ip ) {
		global $gDatabase;
		if ( !$ip ) {
			return;
		}
		$ip = $gDatabase->real_escape_string( $ip );
		$Result = $gDatabase->query( "SELECT * FROM users WHERE name = '$ip' LIMIT 1" ); // IPs are stored as the names of anonymous users
		$DATA = $Result->fetch_assoc();
		if ( $DATA ) {
			return new User( $DATA );
		}
	}

	static function newFromToken( $token ) {
		global $gDatabase;
		if ( !$token ) {
			return;
		}
		$token = $gDatabase->real_escape_string( $token );
		$Result = $gDatabase->query( "SELECT * FROM users WHERE token = '$token' LIMIT 1" );
		$DATA = $Result->fetch_assoc();
		if ( $DATA ) {
			return new User( $DATA );
		}
	}

	function isAdmin() {
		if ( $this->status === 'admin' ) {
			return true;
		}
		return false;
	}

	function canEdit( $Pixel ) {
		if ( $this->id === $Pixel->author_id ) {
			return true;
		}
		if ( $this->isAdmin() ) {
			return true;
		}
		return false;
	}

	function insert() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'INSERT INTO users (
			facebook_id,
			insert_time,
			update_time,
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
		$this->insert_time = $_SERVER['REQUEST_TIME'];
		$this->update_time = $_SERVER['REQUEST_TIME'];
		$Statement->bind_param( 'siiiisssssssi',
			$this->facebook_id,
			$this->insert_time,
			$this->update_time,
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
			insert_time = ?,
			update_time = ?,
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
		$this->update_time = $_SERVER['REQUEST_TIME'];
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
	}

	function delete() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'DELETE FROM users WHERE id = ? LIMIT 1' );
		$Statement->bind_param( 'i', $this->id );
		$Statement->execute();
	}
}