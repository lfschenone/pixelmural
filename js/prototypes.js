/* Extensions to the JavaScript prototypes */

String.prototype.pad = function( size ) {
	var string = this;
	while ( string.length < size ) {
		string = "0" + string;
	}
	return string;
}

Array.prototype.contains = function( string ) {
	var i = this.length;
	while ( i-- ) {
		if ( this[ i ] == string ) {
			return true;
		}
	}
	return false;
}

Array.prototype.remove = function( item ) {
	var index = this.indexOf( item );
	this.splice( index, 1 );
	return this;
}

Array.prototype.move = function ( old_index, new_index ) {
	if ( new_index >= this.length ) {
		var k = new_index - this.length;
		while ( (k--) + 1 ) {
			this.push( undefined );
		}
	}
	this.splice( new_index, 0, this.splice( old_index, 1 )[0] );
	return this;
}

Object.clone = function( Object ) {
	var Clone = {};
	for ( var i in Object ) {
		Clone[ i ] = Object[ i ];
	}
	return Clone;
}

CanvasRenderingContext2D.prototype.clear = function() {
	this.clearRect( 0, 0, this.canvas.width, this.canvas.height );
	return this;
}