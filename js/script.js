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
	$( '#board' )
		.mousedown( mouse.down )
		.mousemove( mouse.move )
		.mouseup( mouse.up );
	$( '#menu #gridButton' ).click( menu.onGridButtonClick );
	$( '#menu #moveButton' ).click( menu.onMoveButtonClick );
	$( '#menu #zoomInButton' ).click( menu.onZoomInButtonClick );
	$( '#menu #zoomOutButton' ).click( menu.onZoomOutButtonClick );
	$( '#menu #pencilButton' ).click( menu.onPencilButtonClick );
	$( '#menu #eyedropButton' ).click( menu.onEyedropButtonClick );
	$( '#menu #eraserButton' ).click( menu.onEraserButtonClick );
	$( '#menu #colorInput' ).change( menu.changeColor );
	$( document ).keydown( keyboard.onKeydown );

	menu.setAlert( 'Loading pixels, please wait...' );
	firebase.on( 'child_added', board.addChild );
	firebase.on( 'child_changed', board.changeChild );
	firebase.on( 'child_removed', board.removeChild );

	$( '#colorInput' ).spectrum({
		preferredFormat: "hex",
		showButtons: false
	});
});

firebase = new Firebase( 'https://pixel-by-pixel.firebaseio.com/' );

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

	onPencilButtonClick: function( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		mouse.downAction = 'drawPixel';
		mouse.dragAction = null;
	},

	onEyedropButtonClick: function( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		mouse.downAction = 'suckColor';
		mouse.dragAction = null;
	},

	onEraserButtonClick: function( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		mouse.downAction = 'clearPixel';
		mouse.dragAction = 'clearPixel';
	},

	changeColor: function( event ) {
		menu.color = event.target.value;
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
			keyboard.onSpaceBar();
		}
		//Left arrow
		if ( event.keyCode == 37 ) {
			keyboard.onLeftArrow();
		}
		//Up arrow
		if ( event.keyCode == 38 ) {
			keyboard.onUpArrow();
		}
		//Right arrow
		if ( event.keyCode == 39 ) {
			keyboard.onRightArrow();
		}
		//Down arrow
		if ( event.keyCode == 40 ) {
			keyboard.onDownArrow();
		}
	},

	onSpaceBar: function() {
		$( '#moveButton' ).click();
	},

	onLeftArrow: function() {
		board.topLeftX -= 1;
		board.redraw();
	},
	onUpArrow: function() {
		board.topLeftY -= 1;
		board.redraw();
	},
	onRightArrow: function() {
		board.topLeftX += 1;
		board.redraw();
	},
	onDownArrow: function() {
		board.topLeftY += 1;
		board.redraw();
	}
}

mouse = {

	/**
	 * X and Y coordinates of the current position of the mouse.
	 * This is NOT the distance from the top left corner of the screen
	 * but rather the distance from the origin of the coordinate system.
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
		mouse[ mouse.downAction ]();
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

	suckColor: function() {
		var dataRef = firebase.child( mouse.currentX + ':' + mouse.currentY );
		dataRef.once( 'value', function( snapshot ) { //TODO: Use the 'transaction' method instead?
			var data = snapshot.val();
			if ( data ) {
				menu.setColor( data.color );
				mouse.downAction = 'drawPixel';
			} else {
				mouse.downAction = 'clearPixel';
			}
		});
		return mouse;
	},

	drawPixel: function() {
		var dataRef = firebase.child( mouse.currentX + ':' + mouse.currentY );
		dataRef.once( 'value', function( snapshot ) { //TODO: Use the 'transaction' method instead?
			var data = snapshot.val();
			if ( data ) {
				if ( data.ip == user.ip ) {
					if ( data.color == menu.color && mouse.currentX == mouse.previousX && mouse.currentY == mouse.currentY ) {
						board.clearPixel( mouse.currentX, mouse.currentY );
						dataRef.remove();
					} else {
						board.fillPixel( mouse.currentX, mouse.currentY, menu.color );
						dataRef.child( 'color' ).set( menu.color );
					}
				} else {
					menu.setAlert( 'Not your pixel', 1000 );
				}
			} else {
				board.fillPixel( mouse.currentX, mouse.currentY, menu.color );
				dataRef.set({ 'ip': user.ip, 'color': menu.color });
			}
		});
		return mouse;
	},

	clearPixel: function() {
		var dataRef = firebase.child( mouse.currentX + ':' + mouse.currentY );
		dataRef.once( 'value', function( snapshot ) { //TODO: Use the 'transaction' method instead?
			var data = snapshot.val();
			if ( data ) {
				board.clearPixel( mouse.currentX, mouse.currentY );
				dataRef.remove();
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

		board.redraw();
		return board;
	},

	zoomIn: function() {
		if ( board.pixelSize == 64 ) {
			return board;
		}
		board.setPixelSize( board.pixelSize * 2 );
		board.topLeftX += Math.floor( board.xPixels / 2 );
		board.topLeftY += Math.floor( board.yPixels / 2 );
		board.redraw();
		return board;
	},

	zoomOut: function() {
		if ( board.pixelSize == 1 ) {
			return board;
		}
		board.setPixelSize( board.pixelSize / 2 );
		board.topLeftX -= Math.floor( board.xPixels / 4 );
		board.topLeftY -= Math.floor( board.yPixels / 4 );
		board.redraw();
		return board;
	},

	fill: function() {
		firebase.once( 'value', function( snapshot ) { //TODO: Use the 'transaction' method instead?
			snapshot.forEach( board.addChild );
		});
		return board;
	},

	clear: function() {
		board.context.clear();
		return board;
	},

	redraw: function() {
		board.clear().fill();
		grid.toggle().toggle();
		return board;
	},

	fillPixel: function( x, y, color ) {
/*
		if ( x < 0 || y < 0 || x > board.xPixels || y > board.yPixels ) {
			return board; //If the pixel is outside the field of view, don't draw it
		}
*/
		rectX = ( x - board.topLeftX ) * board.pixelSize;
		rectY = ( y - board.topLeftY ) * board.pixelSize;
		rectW = board.pixelSize;
		rectH = board.pixelSize;
		board.context.fillStyle = color;
		board.context.fillRect( rectX, rectY, rectW, rectH );
		return board;
	},

	clearPixel: function( x, y ) {
/*
		if ( x < 0 || y < 0 || x > board.xPixels || y > board.yPixels ) {
			return board //If the pixel is outside the field of view, exit
		}
*/
		rectX = ( x - board.topLeftX ) * board.pixelSize;
		rectY = ( y - board.topLeftY ) * board.pixelSize;
		rectW = board.pixelSize;
		rectH = board.pixelSize;
		board.context.clearRect( rectX, rectY, rectW, rectH );
		return board;
	},

	addChild: function( snapshot ) {
		var coords = snapshot.name().split( ":" );
		var x = parseInt( coords[0] );
		var y = parseInt( coords[1] );
/*
		if ( x < 0 || y < 0 || x > board.xPixels || y > board.yPixels ) {
			return board; //If the pixel is outside the field of view, don't draw it
		}
*/
		var color = snapshot.val().color;
		board.fillPixel( x, y, color );
		menu.setAlert( '' ); //This will be called once for every pixel, but I can't find a way around it
	},

	changeChild: function( snapshot ) {
		return board.addChild( snapshot );
	},

	removeChild: function( snapshot ) {
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