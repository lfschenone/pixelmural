<?php

class Image {

	public $width;
	public $height;
	public $image;
	public $color;

	function __construct( $width, $height ) {
		$this->width = $width;
		$this->height = $height;
		$this->image = imagecreatetruecolor( $width, $height );
	}

	function save( $filename ) {
		imagepng( $this->image, $filename );
		return $this;
	}

	function draw() {
		header( 'Content-Type: image/png' );
		imagepng( $this->image );
		return $this;
	}

	function destroy() {
		imagedestroy( $this->image );
		return null; //Or return $this?
	}

	function __destruct() {
		$this->destroy();
	}

	//Drawers
	
	function drawPoint( $x, $y ) {
		return imageline( $this->image, $x, $y, $x, $y, $this->color );
	}
	
	function drawLine( $x1, $y1, $x2, $y2 ) {
		return imageline( $this->image, $x1, $y1, $x2, $y2, $this->color );
	}
	
	function drawArc( $cx, $cy, $width, $height, $start, $end ) {
		return imagearc( $this->image, $cx, $cy, $width, $height, $start, $end, $this->color );
	}
	
	function drawCircle( $x, $y, $radius ) {
		return imagearc( $this->image, $x, $y, $radius * 2, $radius * 2, 0, 0, $this->color );
	}
	
	function drawRectangle( $x1, $y1, $x2, $y2 ) {
		return imagerectangle( $this->image, $x1, $y1, $x2, $y2, $this->color );
	}
	
	function drawString( $string, $x = 0, $y = 0, $font = 0 ) {
		return imagestring( $this->image, $font, $x, $y, $string, $this->color );
	}

	function drawFilledRectangle( $x1, $y1, $x2, $y2 ) {
		return imagefilledrectangle( $this->image, $x1, $y1, $x2, $y2, $this->color );
	}

	//Getters
	
	function getWidth() {
		return imagesx( $this->image );
	}
	
	function getHeight() {
		return imagesy( $this->image );
	}
	
	//Setters
	
	function setColor( $red, $green, $blue ) {
		$this->color = imagecolorallocate( $this->image, $red, $green, $blue );
		return $this;
	}

	function setColorFromHex( $hex ) {
		$red = hexdec( substr( $hex, 1, 2 ) );
		$green = hexdec( substr( $hex, 3, 2 ) );
		$blue = hexdec( substr( $hex, 5, 2 ) );
		$this->setColor( $red, $green );
		return $this;
	}
}