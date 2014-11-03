$( function () {

	//Set the defaults
	board.setCanvas( document.getElementById( 'board' ) );
	board.setContext( board.canvas.getContext( '2d' ) );
	board.setWidth( window.innerWidth );
	board.setHeight( window.innerHeight );
	grid.setCanvas( document.getElementById( 'grid' ) );
	grid.setContext( grid.canvas.getContext( '2d' ) );
	grid.setWidth( board.width );
	grid.setHeight( board.height );

	//Bind events
	$( '#board' ).mousedown( mouse.down ).mousemove( mouse.move ).mouseup( mouse.up );
	$( '#gridButton' ).click( menu.onGridButtonClick );
	$( '#zoomInButton' ).click( menu.onZoomInButtonClick );
	$( '#zoomOutButton' ).click( menu.onZoomOutButtonClick );
	$( '#undoButton' ).click( menu.onUndoButtonClick );
	$( '#redoButton' ).click( menu.onRedoButtonClick );
	$( '#moveButton' ).click( menu.onMoveButtonClick );
	$( '#eyedropButton' ).click( menu.onEyedropButtonClick );
	$( '#pencilButton' ).click( menu.onPencilButtonClick );
	$( '#bucketButton' ).click( menu.onBucketButtonClick );
	$( '#eraserButton' ).click( menu.onEraserButtonClick );
	$( document ).keydown( keyboard.onKeydown );

	//Set 'Move' as the default action
	$( '#moveButton' ).click();

	//Fill the board
	board.fill();

	//Initialize spectrum
	$( '#colorInput' ).spectrum({
		preferredFormat: 'hex',
		showButtons: false,
		move: function ( color ) {
			menu.setColor( color.toHexString() );
		}
	});
});

user = {

	ip: null,

	/**
	 * Part of the undo/redo functionality
	 * The rest is in the mouse.paintPixel and mouse.erasePixel methods
	 */
	oldPixels: [],
	newPixels: [],
	arrayPointer: 0,

	undo: function () {
		if ( user.arrayPointer === 0 ) {
			return false;
		}
		user.arrayPointer--;
		var oldPixel = user.oldPixels[ user.arrayPointer ];
		board.paintPixel( oldPixel.x, oldPixel.y, oldPixel.color ).savePixel( oldPixel.x, oldPixel.y, oldPixel.color );
	},

	redo: function () {
		if ( user.arrayPointer === user.newPixels.length ) {
			return false;
		}
		var newPixel = user.newPixels[ user.arrayPointer ];
		user.arrayPointer++;
		board.paintPixel( newPixel.x, newPixel.y, newPixel.color ).savePixel( newPixel.x, newPixel.y, newPixel.color );
	}
}

menu = {

	alert: '',

	color: '#ffffff',

	onGridButtonClick: function ( event ) {
		grid.toggle();
	},

	onZoomInButtonClick: function ( event ) {
		board.zoomIn();
	},

	onZoomOutButtonClick: function ( event ) {
		board.zoomOut();
	},

	onUndoButtonClick: function ( event ) {
		user.undo();
	},

	onRedoButtonClick: function ( event ) {
		user.redo();
	},

	onMoveButtonClick: function ( event ) {
		$( '#board' ).css( 'cursor', 'move' );
		$( '#moveButton' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'moveBoard1';
		mouse.dragAction = 'moveBoard2';
		mouse.upAction = 'moveBoard3';
	},

	onEyedropButtonClick: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#eyedropButton' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'suckColor';
		mouse.dragAction = null;
		mouse.upAction = null;
	},

	onPencilButtonClick: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#pencilButton' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'paintPixel';
		mouse.dragAction = null;
		mouse.upAction = null;
	},

	onBucketButtonClick: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#bucketButton' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'paintArea';
		mouse.dragAction = null;
		mouse.upAction = null;
	},

	onEraserButtonClick: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#eraserButton' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'erasePixel';
		mouse.dragAction = 'erasePixel';
		mouse.upAction = null;
	},

	setColor: function ( color ) {
		menu.color = color;
		$( '#colorInput' ).val( color );
	},

	setAlert: function ( alert, time ) {
		$( '#alert' ).text( alert );
		window.setTimeout( function () {
			$( '#alert' ).empty();
		}, 1000 );
	}
}

keyboard = {

	onKeydown: function ( event ) {
		//Spacebar
		if ( event.keyCode == 32 ) {
			$( '#moveButton' ).click();
		}
		//B
		if ( event.keyCode == 66 ) {
			$( '#bucketButton' ).click();
		}
		//E
		if ( event.keyCode == 69 ) {
			$( '#eyedropButton' ).click();
		}
		//G
		if ( event.keyCode == 71 ) {
			$( '#gridButton' ).click();
		}
		//I
		if ( event.keyCode == 73 ) {
			$( '#zoomInButton' ).click();
		}
		//O
		if ( event.keyCode == 79 ) {
			$( '#zoomOutButton' ).click();
		}
		//P
		if ( event.keyCode == 80 ) {
			$( '#pencilButton' ).click();
		}
		//R
		if ( event.keyCode == 82 ) {
			$( '#eraserButton' ).click();
		}
		//X
		if ( event.keyCode == 88 ) {
			$( '#redoButton' ).click();
		}
		//Z
		if ( event.keyCode == 90 ) {
			$( '#undoButton' ).click();
		}
	}
}

mouse = {

	/**
	 * This is the distance from the origin of the coordinate system,
	 * NOT the distance from the top left corner of the screen.
	 * The origin of the coordinate system starts at the top left corner of the screen,
	 * but it can be moved by the user.
	 */
	currentX: null,
	currentY: null,

	previousX: null,
	previousY: null,

	state: 'up',

	downAction: null,
	dragAction: null,

	down: function ( event ) {
		mouse.state = 'down';
		mouse[ mouse.downAction ]( event );
		return mouse;
	},

	move: function ( event ) {

		mouse.previousX = mouse.currentX;
		mouse.previousY = mouse.currentY;

		mouse.currentX = board.topLeftX + Math.floor( event.clientX / board.pixelSize );
		mouse.currentY = board.topLeftY + Math.floor( event.clientY / board.pixelSize );

		//If the mouse is being dragged
		if ( mouse.state == 'down' && ( mouse.currentX != mouse.previousX || mouse.currentY != mouse.previousY ) && mouse.dragAction ) {
			mouse[ mouse.dragAction ]( event );
		}

		return mouse;
	},

	up: function ( event ) {
		mouse.state = 'up';
		if ( mouse.upAction ) {
			mouse[ mouse.upAction ]( event );
		}
		return mouse;
	},

	moveBoard1: function ( event ) {
		mouse.diffX = 0;
		mouse.diffY = 0;
		board.imageData = board.context.getImageData( 0, 0, board.width, board.height );
		return mouse;
	},

	moveBoard2: function ( event ) {
		board.topLeftX += mouse.previousX - mouse.currentX;
		board.topLeftY += mouse.previousY - mouse.currentY;

		mouse.diffX += ( mouse.currentX - mouse.previousX ) * board.pixelSize;
		mouse.diffY += ( mouse.currentY - mouse.previousY ) * board.pixelSize;

		board.context.clear();
		board.context.putImageData( board.imageData, mouse.diffX, mouse.diffY );

		//Bug fix
		mouse.currentX = board.topLeftX + Math.floor( event.clientX / board.pixelSize );
		mouse.currentY = board.topLeftY + Math.floor( event.clientY / board.pixelSize );

		return mouse;
	},

	moveBoard3: function ( event ) {
		board.fill();
		return mouse;
	},

	suckColor: function ( event ) {
		var x = mouse.currentX;
		var y = mouse.currentY;
		var imageData = board.context.getImageData( event.clientX, event.clientY, 1, 1 );
		var r = imageData.data[0];
		var g = imageData.data[1];
		var b = imageData.data[2];
		var color = rgbToHex( r, g, b );
		menu.setColor( color );
		$( '#colorInput' ).spectrum( 'set', color );
		return mouse;
	},

	/**
	 * Paint a single pixel
	 *
	 * To avoid lag in the UX, we first paint the pixel, we then check the database via an ajax call
	 * and we then reverse it if necessary
	 */
	paintPixel: function ( event ) {
		var x = mouse.currentX;
		var y = mouse.currentY;
		var newColor = menu.color;

		var imageData = board.context.getImageData( event.clientX, event.clientY, 1, 1 );
		var red = imageData.data[0];
		var green = imageData.data[1];
		var blue = imageData.data[2];
		var alpha = imageData.data[3];
		var oldColor = null; // Default
		if ( alpha > 0 ) {
			oldColor = rgbToHex( red, green, blue );
		}

		//Part of the undo/redo functionality
		user.oldPixels.splice( user.arrayPointer, user.oldPixels.length - user.arrayPointer, { 'x': x, 'y': y, 'color': oldColor } );
		user.newPixels.splice( user.arrayPointer, user.newPixels.length - user.arrayPointer, { 'x': x, 'y': y, 'color': newColor } );
		user.arrayPointer++;


		if ( newColor === oldColor ) {
			board.paintPixel( x, y, null ).savePixel( x, y, null );
		} else {
			board.paintPixel( x, y, newColor ).savePixel( x, y, newColor );
		}
		return mouse;
	},

	paintArea: function ( event ) {
		var x = mouse.currentX;
		var y = mouse.currentY;
		var color = menu.color;
		var data = { 'x': x, 'y': y, 'color': color };
		$.get( 'ajax/paintArea', data, function ( data ) {
			//console.log( data );
			switch ( data ) {
				case 'The background changed only for you':
					$( board.canvas ).css( 'background', color );
					menu.setAlert( data )
					break;
				case 'Not your pixel':
					menu.setAlert( data );
					break;
				default: //Assume everything went ok
					data = JSON.parse( data );
					var pixel;
					for ( var i = 0; i < data.length; i++ ) {
						pixel = data[ i ];
						board.paintPixel( pixel.x, pixel.y, pixel.color );
					}
			}
		});
		return mouse;
	},

	erasePixel: function ( event ) {
		var x = mouse.currentX;
		var y = mouse.currentY;

		var imageData = board.context.getImageData( event.clientX, event.clientY, 1, 1 );
		var red = imageData.data[0];
		var green = imageData.data[1];
		var blue = imageData.data[2];
		var alpha = imageData.data[3];
		if ( alpha === 0 ) {
			return mouse;
		}
		var oldColor = rgbToHex( red, green, blue );

		// Part of the undo/redo functionality
		user.oldPixels.splice( user.arrayPointer, user.oldPixels.length - user.arrayPointer, { 'x': x, 'y': y, 'color': oldColor } );
		user.newPixels.splice( user.arrayPointer, user.newPixels.length - user.arrayPointer, { 'x': x, 'y': y, 'color': null } );
		user.arrayPointer++;


		board.paintPixel( x, y, null ).savePixel( x, y, null );
		return mouse;
	}
}

board = {

	canvas: {},

	context: {},

	width: 300,
	height: 150,

	topLeftX: 0,
	topLeftY: 0,

	pixelSize: 4,

	xPixels: 30,
	yPixels: 15,

	background: 'black',

	/* Getters */

	getXpixels: function () {
		return Math.floor( board.width / board.pixelSize );
	},

	getYpixels: function () {
		return Math.floor( board.height / board.pixelSize );
	},

	getPixel: function ( x, y ) {
		var imageData = board.context.getImageData( x, y, 1, 1 );
		var red = imageData.data[0];
		var green = imageData.data[1];
		var blue = imageData.data[2];
		var alpha = imageData.data[3];
		if ( alpha > 0 ) {
			var oldColor = rgbToHex( red, green, blue );
		} else {
			var oldColor = null;
		}
		return { 'x': x, 'y': y, 'color': color };
	},

	/* Setters */

	setCanvas: function ( value ) {
		board.canvas = value;
		return board;
	},

	setContext: function ( value ) {
		board.context = value;
		return board;
	},

	setWidth: function ( value ) {
		board.width = value;
		board.canvas.setAttribute( 'width', value );
		board.xPixels = board.getXpixels();
		return board;
	},

	setHeight: function ( value ) {
		board.height = value;
		board.canvas.setAttribute( 'height', value );
		board.yPixels = board.getYpixels();
		return board;
	},

	setPixelSize: function ( value ) {
		board.pixelSize = parseInt( value );
		if ( board.pixelSize > 64 ) {
			board.pixelSize = 64; //Max pixel size
		}
		if ( board.pixelSize < 1 ) {
			board.pixelSize = 1; //Min pixel size
		}
		board.xPixels = board.getXpixels();
		board.yPixels = board.getYpixels();
		return board;
	},

	zoomIn: function () {
		if ( board.pixelSize == 64 ) {
			return board;
		}
		board.setPixelSize( board.pixelSize * 2 );
		board.topLeftX += Math.floor( board.xPixels / 2 );
		board.topLeftY += Math.floor( board.yPixels / 2 );
		board.refill();
		return board;
	},

	zoomOut: function () {
		if ( board.pixelSize == 1 ) {
			return board;
		}
		board.setPixelSize( board.pixelSize / 2 );
		board.topLeftX -= Math.floor( board.xPixels / 4 );
		board.topLeftY -= Math.floor( board.yPixels / 4 );
		board.refill();
		return board;
	},

	fill: function () {
		menu.setAlert( 'Loading pixels, please wait...' );
		var data = {
			'x': board.topLeftX,
			'y': board.topLeftY,
			'width': board.xPixels,
			'height': board.yPixels
		};
		$.get( 'ajax/getArea', data, function ( data ) {
			var pixel;
			for ( var i = 0; i < data.length; i++ ) {
				pixel = data[ i ];
				board.paintPixel( pixel.x, pixel.y, pixel.color );
			}
		}, 'json' );
		return board;
	},

	clear: function () {
		board.context.clear();
		return board;
	},

	refill: function () {
		board.clear().fill();
		grid.toggle().toggle();
		return board;
	},

	paintPixel: function ( x, y, color ) {
		rectX = ( x - board.topLeftX ) * board.pixelSize;
		rectY = ( y - board.topLeftY ) * board.pixelSize;
		rectW = board.pixelSize;
		rectH = board.pixelSize;
		if ( color === null ) {
			board.context.clearRect( rectX, rectY, rectW, rectH );
		} else {
			board.context.fillStyle = color;
			board.context.fillRect( rectX, rectY, rectW, rectH );
		}
		return board;
	},

	savePixel: function ( x, y, color ) {
		var data = { 'x': x, 'y': y, 'color': color };
		$.get( 'ajax/paintPixel', data, function ( response ) {
			//console.log( response );
			switch ( response.message ) {
				case 'Pixel inserted':
					break;
				case 'Pixel updated':
					break;
				case 'Pixel deleted':
					break;
				case 'Not your pixel':
					board.paintPixel( response.Pixel.x, response.Pixel.y, response.Pixel.color );
/*
					for ( var i in user.oldPixels ) {
						if ( user.oldPixels[ i ].x === response.Pixel.x && user.oldPixels[ i ].y === response.Pixel.y ) {
							user.oldPixels.splice( i, 1 );
							user.newPixels.splice( i, 1 );
						}
					}
*/
					menu.setAlert( response.message );
					break;
			}
		}, 'json' );
		return board;
	}
}

grid = {

	canvas: {},

	context: {},

	color: '#777777',

	visible: false,

	setCanvas: function ( value ) {
		grid.canvas = value
		return grid
	},

	setContext: function ( value ) {
		grid.context = value
		return grid
	},

	setWidth: function ( value ) {
		grid.width = value;
		grid.canvas.setAttribute( 'width', value );
		return grid;
	},

	setHeight: function ( value ) {
		grid.height = value;
		grid.canvas.setAttribute( 'height', value );
		return grid;
	},

	show: function () {
		grid.visible = true;
		if ( board.pixelSize < 4 ) {
			return grid; //If the pixels are too small, don't draw the grid
		}
		grid.context.beginPath();

		for ( var x = 0; x <= board.xPixels; x++ ) {
			grid.context.moveTo( x * board.pixelSize - 0.5, 0 );
			grid.context.lineTo( x * board.pixelSize - 0.5, grid.height );
		}
		for ( var y = 0; y <= board.yPixels; y++ ) {
			grid.context.moveTo( 0, y * board.pixelSize - 0.5 );
			grid.context.lineTo( grid.width, y * board.pixelSize - 0.5 );
		}

		grid.context.strokeStyle = grid.color;
		grid.context.stroke();
		return grid;
	},

	hide: function () {
		grid.visible = false;
		grid.context.clear();
		return grid;
	},

	toggle: function () {
		if ( grid.visible ) {
			grid.hide();
		} else {
			grid.show();
		}
		return grid;
	}
}

/*
function Pixel( x, y, color ) {
	this.x = x;
	this.y = y;
	this.color = color;

	this.save = function () {
		
	}
}
*/