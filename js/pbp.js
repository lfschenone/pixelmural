$( function() {

	//Set the defaults
	board.setCanvas( document.getElementById('board') );
	board.setContext( board.canvas.getContext('2d') );
	board.setWidth( window.innerWidth );
	board.setHeight( window.innerHeight );
	grid.setCanvas( document.getElementById('grid') );
	grid.setContext( grid.canvas.getContext('2d') );
	grid.setWidth( board.width );
	grid.setHeight( board.height );

	//Bind events
	$( '#board' ).
		mousedown( mouse.down ).
		mousemove( mouse.move ).
		mouseup( mouse.up );
	$( '#menu #gridButton' ).click( menu.onGridButtonClick );
	$( '#menu #moveButton' ).click( menu.onMoveButtonClick );
	$( '#menu #zoomInButton' ).click( menu.onZoomInButtonClick );
	$( '#menu #zoomOutButton' ).click( menu.onZoomOutButtonClick );
	$( '#menu #eyedropButton' ).click( menu.onEyedropButtonClick );
	$( '#menu #pencilButton' ).click( menu.onPencilButtonClick );
	$( '#menu #bucketButton' ).click( menu.onBucketButtonClick );
	$( '#menu #eraserButton' ).click( menu.onEraserButtonClick );
	$( '#menu #colorInput' ).change( menu.onColorInputChange );
	$( document ).keydown( keyboard.onKeydown );

	//Fill the board
	board.fill();

	//Initialize spectrum
	$( '#colorInput' ).spectrum({
		preferredFormat: "hex",
		showButtons: false,
		move: function( color ) {
			menu.setColor( color.toHexString() );
		}
	});
});

user = {
	ip: null
}

menu = {

	alert: '',

	color: '#ffffff',

	onGridButtonClick: function( event ) {
		grid.toggle();
	},

	onMoveButtonClick: function( event ) {
		$( '#board' ).css( 'cursor', 'move' );
		mouse.downAction = 'moveBoard';
		mouse.dragAction = 'moveBoard';
	},

	onZoomInButtonClick: function( event ) {
		board.zoomIn();
	},

	onZoomOutButtonClick: function( event ) {
		board.zoomOut();
	},

	onEyedropButtonClick: function( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		mouse.downAction = 'suckColor';
		mouse.dragAction = null;
	},

	onPencilButtonClick: function( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		mouse.downAction = 'drawPixel';
		mouse.dragAction = null;
	},

	onBucketButtonClick: function( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		mouse.downAction = 'paintArea';
		mouse.dragAction = null;
	},

	onEraserButtonClick: function( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		mouse.downAction = 'clearPixel';
		mouse.dragAction = 'clearPixel';
	},

	setColor: function( color ) {
		menu.color = color;
		$( '#colorInput' ).val( color );
	},

	setAlert: function( alert ) {
		$( '#alert' ).text( alert );
	}
}

keyboard = {

	onKeydown: function( event ) {
		//Space bar
		if ( event.keyCode == 32 ) {
			$( '#moveButton' ).click();
		}
		//Left arrow
		if ( event.keyCode == 37 ) {
			board.topLeftX -= 1;
			board.refill();
		}
		//Up arrow
		if ( event.keyCode == 38 ) {
			board.topLeftY -= 1;
			board.refill();
		}
		//Right arrow
		if ( event.keyCode == 39 ) {
			board.topLeftX += 1;
			board.refill();
		}
		//Down arrow
		if ( event.keyCode == 40 ) {
			board.topLeftY += 1;
			board.refill();
		}
		//B
		if ( event.keyCode == 66 ) {
			menu.onBucketButtonClick();
		}
		//E
		if ( event.keyCode == 69 ) {
			menu.onEyedropButtonClick();
		}
		//P
		if ( event.keyCode == 80 ) {
			menu.onPencilButtonClick();
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

	downAction: 'drawPixel',
	dragAction: null,

	down: function( event ) {
		mouse.state = 'down';
		mouse[ mouse.downAction ]( event );
		return mouse;
	},

	move: function( event ) {

		mouse.previousX = mouse.currentX;
		mouse.previousY = mouse.currentY;

		mouse.currentX = board.topLeftX + Math.floor( event.clientX / board.pixelSize );
		mouse.currentY = board.topLeftY + Math.floor( event.clientY / board.pixelSize );

		//If the mouse is being dragged
		if ( mouse.state == 'down' && ( mouse.currentX != mouse.previousX || mouse.currentY != mouse.previousY ) && mouse.dragAction ) {
			mouse[ mouse.dragAction ]();
		}

		return mouse;
	},

	up: function( event ) {
		mouse.state = 'up';
		return mouse;
	},

	moveBoard: function() {
		board.move();
	},

	suckColor: function( event ) {
		var x = mouse.currentX;
		var y = mouse.currentY;
		var imageData = board.context.getImageData( event.clientX, event.clientY, 1, 1 );
		var r = imageData.data[0];
		var g = imageData.data[1];
		var b = imageData.data[2];
		var color = rgbToHex( r, g, b );
		menu.setColor( color );
		$( '#colorInput' ).spectrum( 'set', color );
		mouse.downAction = 'drawPixel';
		return mouse;
	},

	drawPixel: function() {
		var x = mouse.currentX;
		var y = mouse.currentY;
		var color = menu.color;
		$.get( 'ajax/drawPixel?x=' + x + '&y=' + y + '&color=' + color.substring(1), function( data ) {
			//console.log( data );
			switch ( data ) {
				case 'Pixel inserted':
					board.paintPixel( x, y, color );
					break;
				case 'Pixel updated':
					board.paintPixel( x, y, color );
					break;
				case 'Pixel deleted':
					board.clearPixel( x, y );
					break;
				case 'Not your pixel':
					menu.setAlert( data );
					break;
			}
		});
		return mouse;
	},

	paintArea: function() {
		var x = mouse.currentX;
		var y = mouse.currentY;
		var color = menu.color;
		$.get( 'ajax/paintArea?x=' + x + '&y=' + y + '&color=' + color.substring(1), function( data ) {
			//console.log( data );
			switch ( data ) {
				case 'Pixel inserted':
					board.paintPixel( x, y, color );
					break;
				case 'Pixel deleted':
					board.clearPixel( x, y );
					break;
				case 'Not your pixel':
					menu.setAlert( data );
					break;
				default: //Assume everything went ok
					data = JSON.parse( data );
					var i, pixel;
					for ( i = 0; i < data.length; i++ ) {
						pixel = data[ i ];
						board.paintPixel( pixel.x, pixel.y, pixel.color );
					}
			}
		});
		return mouse;
	},

	clearPixel: function() {
		var x = mouse.currentX;
		var y = mouse.currentY;
		$.get( 'ajax/clearPixel?x=' + x + '&y=' + y, function( data ) {
			//console.log( data );
			if ( data == 'Pixel deleted' ) {
				board.clearPixel( x, y );
			}
		});
		return mouse;
	}
}

board = {

	canvas: {},

	context: {},

	width: 800,
	height: 600,

	topLeftX: 0,
	topLeftY: 0,

	pixelSize: 8,

	xPixels: 80,
	yPixels: 60,

	background: 'black',

	/* Getters */

	getXpixels: function() {
		return Math.floor( board.width / board.pixelSize );
	},

	getYpixels: function() {
		return Math.floor( board.height / board.pixelSize );
	},

	/* Setters */

	setCanvas: function( value ) {
		board.canvas = value;
		return board;
	},

	setContext: function( value ) {
		board.context = value;
		return board;
	},

	setWidth: function( value ) {
		board.width = value;
		board.canvas.setAttribute( 'width', value );
		board.xPixels = board.getXpixels();
		return board;
	},

	setHeight: function( value ) {
		board.height = value;
		board.canvas.setAttribute( 'height', value );
		board.yPixels = board.getYpixels();
		return board;
	},

	setPixelSize: function( value ) {
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

	/* Methods */

	move: function() {
		board.topLeftX += mouse.previousX - mouse.currentX;
		board.topLeftY += mouse.previousY - mouse.currentY;

		//Bug fix
		mouse.currentX = board.topLeftX + Math.floor( event.clientX / board.pixelSize );
		mouse.currentY = board.topLeftY + Math.floor( event.clientY / board.pixelSize );

		board.refill();
		return board;
	},

	zoomIn: function() {
		if ( board.pixelSize == 64 ) {
			return board;
		}
		board.setPixelSize( board.pixelSize * 2 );
		board.topLeftX += Math.floor( board.xPixels / 2 );
		board.topLeftY += Math.floor( board.yPixels / 2 );
		board.refill();
		return board;
	},

	zoomOut: function() {
		if ( board.pixelSize == 1 ) {
			return board;
		}
		board.setPixelSize( board.pixelSize / 2 );
		board.topLeftX -= Math.floor( board.xPixels / 4 );
		board.topLeftY -= Math.floor( board.yPixels / 4 );
		board.refill();
		return board;
	},

	fill: function() {
		$.get( 'ajax/getPixels', function( data ) {
			//console.log( data );
			data = JSON.parse( data );
			var i, pixel;
			for ( i = 0; i < data.length; i++ ) {
				pixel = data[ i ];
				board.paintPixel( pixel.x, pixel.y, pixel.color );
			}
		});
		return board;
	},

	clear: function() {
		board.context.clear();
		return board;
	},

	refill: function() {
		board.clear().fill();
		grid.toggle().toggle();
		return board;
	},

	paintPixel: function( x, y, color ) {
		rectX = ( x - board.topLeftX ) * board.pixelSize;
		rectY = ( y - board.topLeftY ) * board.pixelSize;
		rectW = board.pixelSize;
		rectH = board.pixelSize;
		board.context.fillStyle = color;
		board.context.fillRect( rectX, rectY, rectW, rectH );
		return board;
	},

	clearPixel: function( x, y ) {
		rectX = ( x - board.topLeftX ) * board.pixelSize;
		rectY = ( y - board.topLeftY ) * board.pixelSize;
		rectW = board.pixelSize;
		rectH = board.pixelSize;
		board.context.clearRect( rectX, rectY, rectW, rectH );
		return board;
	}
}

grid = {

	canvas: {},

	context: {},

	color: '#777777',

	visible: false,

	setCanvas: function( value ) {
		grid.canvas = value
		return grid
	},

	setContext: function( value ) {
		grid.context = value
		return grid
	},

	setWidth: function( value ) {
		grid.width = value;
		grid.canvas.setAttribute( 'width', value );
		return grid;
	},

	setHeight: function( value ) {
		grid.height = value;
		grid.canvas.setAttribute( 'height', value );
		return grid;
	},

	show: function() {
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

	hide: function() {
		grid.visible = false;
		grid.context.clear();
		return grid;
	},

	toggle: function() {
		if ( grid.visible ) {
			grid.hide();
		} else {
			grid.show();
		}
		return grid;
	}
}