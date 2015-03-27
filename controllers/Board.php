<?php

class Board extends Controller {

	static function view() {
		$topLeftX = GET( 'topLeftX' );
		$topLeftY = GET( 'topLeftY' );
		$pixelSize = GET( 'pixelSize' );
		include 'views/board.php';
	}
}