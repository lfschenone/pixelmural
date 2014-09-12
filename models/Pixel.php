<?php

class Pixel extends Model {

	public $x;
	public $y;
	public $ip;
	public $time;
	public $color;

	static function newFromCoords( $x, $y ) {
		global $gDatabase;
		$Result = $gDatabase->query( "SELECT * FROM pixels WHERE x = $x AND y = $y LIMIT 1" );
		$DATA = $Result->fetch_assoc();
		if ( $DATA ) {
			return new Pixel( $DATA );
		}
		return null;
	}

	function insert() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'INSERT INTO pixels (
			x,
			y,
			ip,
			time,
			color
			) VALUES (?,?,?,?,?)'
		);
		$Statement->bind_param( 'iisis',
			$this->x,
			$this->y,
			$this->ip,
			$this->time,
			$this->color
		);
		$Statement->execute();
		return $gDatabase->insert_id;
	}

	function update() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'UPDATE pixels SET
			ip = ?,
			time = ?,
			color = ?
			WHERE x = ? AND y = ?'
		);
		$Statement->bind_param( 'sisii',
			$this->ip,
			$this->time,
			$this->color,
			$this->x,
			$this->y
		);
		$Statement->execute();
		return true;
	}

	function delete() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'DELETE FROM pixels WHERE x = ? AND y = ? LIMIT 1' );
		$Statement->bind_param( 'ii', $this->x, $this->y );
		$Statement->execute();
	}
}