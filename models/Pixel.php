<?php

class Pixel extends Model {

	public $x;
	public $y;
	public $author_id;
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

	function getAuthor() {
		return User::newFromId( $this->author_id );
	}

	function insert() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'INSERT INTO pixels (
			x,
			y,
			author_id,
			time,
			color
			) VALUES (?,?,?,?,?)'
		);
		$Statement->bind_param( 'iiiis',
			$this->x,
			$this->y,
			$this->author_id,
			$this->time,
			$this->color
		);
		$Statement->execute();
		return $gDatabase->insert_id;
	}

	function update() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'UPDATE pixels SET
			author_id = ?,
			time = ?,
			color = ?
			WHERE x = ? AND y = ?'
		);
		$Statement->bind_param( 'iisii',
			$this->author_id,
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