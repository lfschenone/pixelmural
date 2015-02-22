$( function () {

	// Initialize spectrum
	$( '#colorInput' ).spectrum({
		preferredFormat: 'hex',
		showButtons: false,
		move: function ( color ) {
			menu.setColor( color.toHexString() );
		}
	});

	// Set the variables that must wait for the DOM to be loaded
	board.setCanvas( document.getElementById( 'board' ) );
	board.setContext( board.canvas.getContext( '2d' ) );
	board.setBackground( '#aaaaaa' );
	board.setWidth( window.innerWidth );
	board.setHeight( window.innerHeight );
	board.setTopLeftX( board.getTopLeftX() );
	board.setTopLeftY( board.getTopLeftY() );
	board.setPixelSize( board.getPixelSize() );
	grid.setCanvas( document.getElementById( 'grid' ) );
	grid.setContext( grid.canvas.getContext( '2d' ) );
	grid.setWidth( board.width );
	grid.setHeight( board.height );

	// Bind events
	$( '#menu button' ).mouseover( menu.onButtonMouseover ).mouseout( menu.onButtonMouseout );
	$( '#menu .sp-preview' ).mouseover( menu.onColorInputMouseover ).mouseout( menu.onColorInputMouseout );
	$( '#board' ).mousedown( mouse.down ).mousemove( mouse.move ).mouseup( mouse.up );
	$( '#gridButton' ).click( menu.onGridButtonClick );
	$( '#zoomInButton' ).click( menu.onZoomInButtonClick );
	$( '#zoomOutButton' ).click( menu.onZoomOutButtonClick );
	$( '#undoButton' ).click( menu.onUndoButtonClick );
	$( '#redoButton' ).click( menu.onRedoButtonClick );
	$( '#infoButton' ).click( menu.onInfoButtonClick );
	$( '#moveButton' ).click( menu.onMoveButtonClick );
	$( '#eyedropButton' ).click( menu.onEyedropButtonClick );
	$( '#pencilButton' ).click( menu.onPencilButtonClick );
	$( '#bucketButton' ).click( menu.onBucketButtonClick );
	$( '#eraserButton' ).click( menu.onEraserButtonClick );
	$( '#githubButton' ).click( menu.onGithubButtonClick );
	$( document ).keydown( keyboard.onKeydown );
	$( document ).keyup( keyboard.onKeyup );

	// Set 'Move' as the default action
	$( '#moveButton' ).click();

	// Fill the board
	board.fill();
});

/**
 * This object represents the current user
 */
user = {
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
		oldPixel.paint().save();
	},

	redo: function () {
		if ( user.arrayPointer === user.newPixels.length ) {
			return false;
		}
		var newPixel = user.newPixels[ user.arrayPointer ];
		user.arrayPointer++;
		newPixel.paint().save();
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

	onInfoButtonClick: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#infoButton' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'getInfo';
		mouse.dragAction = null;
		mouse.upAction = null;
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
		mouse.dragAction = 'paintPixel';
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

	onFacebookLoginClick: function ( event ) {
		FB.login();
	},

	onFacebookLogoutClick: function ( event ) {
		FB.logout();
	},

	onGithubButtonClick: function ( event ) {
		location.href = 'https://github.com/lfschenone/pixel-by-pixel';
	},

	onColorInputMouseover: function ( event ) {
		var div = $( this );
		var colorInput = div.parent().prev();
		var title = colorInput.attr( 'title' );
		var tooltip = $( '<span/>' ).addClass( 'tooltip' ).text( title );
		div.after( tooltip );
	},

	onColorInputMouseout: function ( event ) {
		$( '.tooltip' ).remove();
	},

	onButtonMouseover: function ( event ) {
		var button = $( this );
		var title = button.attr( 'title' );
		var tooltip = $( '<span/>' ).addClass( 'tooltip' ).text( title );
		button.append( tooltip );
	},

	onButtonMouseout: function ( event ) {
		$( '.tooltip' ).remove();
	},

	setColor: function ( color ) {
		menu.color = color;
		$( '#colorInput' ).val( color );
	},

	setAlert: function ( alert, duration ) {
		$( '#alert' ).html( alert );
		if ( duration ) {
			window.setTimeout( function () {
				$( '#alert' ).empty();
			}, duration );
		}
	}
}

keyboard = {

	onKeydown: function ( event ) {
		//Alt
		if ( event.keyCode == 18 ) {
			$( '#eyedropButton' ).click();
		}
		//Spacebar
		if ( event.keyCode == 32 ) {
			$( '#moveButton' ).click();
		}
		//A
		if ( event.keyCode == 65 ) {
			$( '#infoButton' ).click();
		}
		//B
		if ( event.keyCode == 66 ) {
			$( '#bucketButton' ).click();
		}
		//E
		if ( event.keyCode == 69 ) {
			$( '#eraserButton' ).click();
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
		//X
		if ( event.keyCode == 88 ) {
			$( '#redoButton' ).click();
		}
		//Z
		if ( event.keyCode == 90 ) {
			$( '#undoButton' ).click();
		}
	},

	onKeyup: function ( event ) {
		//Alt
		if ( event.keyCode == 18 ) {
			$( '#pencilButton' ).click();
		}
	}
}

mouse = {

	/**
	 * The distance from the origin of the coordinate system,
	 * NOT the distance from the top left corner of the screen.
	 * The origin of the coordinate system starts at the top left corner of the screen,
	 * but when the user uses the 'move' tool, it moves
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

/*
		board.context.fillStyle = 'rgba( 0, 0, 0, 0.5 )';
		board.context.fillRect( event.clientX, event.clientY, board.pixelSize, board.pixelSize );

		var imageData = board.context.getImageData( event.clientX, event.clientY, 1, 1 );
		var pixelColor = rgbToHex( imageData.data[0], imageData.data[1], imageData.data[2] );
		var Pixel = new window.Pixel( mouse.currentX, mouse.currentY, pixelColor );
		Pixel.paint(); // Return its color to the pixel
*/

		mouse.currentX = board.topLeftX + Math.floor( event.clientX / board.pixelSize );
		mouse.currentY = board.topLeftY + Math.floor( event.clientY / board.pixelSize );
		//console.log( mouse.currentX, mouse.currentY );

/*
		Pixel.x = mouse.currentX;
		Pixel.y = mouse.currentY;
		Pixel.shine();
*/

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
		var red = imageData.data[0];
		var green = imageData.data[1];
		var blue = imageData.data[2];
		var color = rgbToHex( red, green, blue );
		menu.setColor( color );
		$( '#colorInput' ).spectrum( 'set', color );
		return mouse;
	},

	getInfo: function ( event ) {
		var Pixel = new window.Pixel( mouse.currentX, mouse.currentY, null );
		$.get( 'Ajax/getInfo', Pixel.getProperties(), function ( response ) {
			//console.log( response );
			if ( response.Pixel ) {
				var author = response.Author.name;
				if ( response.Author.link ) {
					author = '<a href="' + response.Author.link + '">' + response.Author.name + '</a>';
				}
				var age = roundSeconds( Math.floor( Date.now() / 1000 ) - response.Pixel.time );
				menu.setAlert( 'By ' + author + ', ' + age + ' ago' );
			} else {
				menu.setAlert( 'Free pixel' );
			}
		});
		return mouse;
	},

	/**
	 * Paint a single pixel
	 *
	 * To avoid lag, first paint the pixel and then check the database to reverse it if necessary
	 */
	paintPixel: function ( event ) {
		// Build the new pixel
		var newPixel = new window.Pixel( mouse.currentX, mouse.currentY, menu.color );

		// Build the old pixel
		var imageData = board.context.getImageData( event.clientX, event.clientY, 1, 1 );
		var red = imageData.data[0];
		var green = imageData.data[1];
		var blue = imageData.data[2];
		var alpha = imageData.data[3];
		var oldColor = alpha ? rgbToHex( red, green, blue ) : null;
		var oldPixel = new window.Pixel( mouse.currentX, mouse.currentY, oldColor );

		// Register the changes for the undo/redo functionality
		user.oldPixels.splice( user.arrayPointer, user.oldPixels.length - user.arrayPointer, oldPixel );
		user.newPixels.splice( user.arrayPointer, user.newPixels.length - user.arrayPointer, newPixel );
		user.arrayPointer++;

		// For convenience, re-painting a pixel erases it
		if ( newPixel.color === oldPixel.color ) {
			//newPixel.color = null;
		}

		newPixel.paint().save();
		return mouse;
	},

	paintArea: function ( event ) {
		var Pixel = new window.Pixel( mouse.currentX, mouse.currentY, menu.color );
		$.get( 'Ajax/paintArea', Pixel.getProperties(), function ( response ) {
			//console.log( response );
			if ( response.message === 'Not your pixel' ) {
				menu.setAlert( response.message, 1000 );
			}
			if ( response.message === 'Area painted' ) {
				var data, Pixel;
				for ( var i in response.PIXELS ) {
					data = response.PIXELS[ i ];
					Pixel = new window.Pixel( data.x, data.y, data.color );
					Pixel.paint();
				}
			}
		});
		return mouse;
	},

	erasePixel: function ( event ) {
		// Build the new pixel
		var newPixel = new window.Pixel( mouse.currentX, mouse.currentY, null );

		// Build the old pixel
		var imageData = board.context.getImageData( event.clientX, event.clientY, 1, 1 );
		var red = imageData.data[0];
		var green = imageData.data[1];
		var blue = imageData.data[2];
		var alpha = imageData.data[3];
		if ( alpha === 0 ) {
			return mouse; // The pixel doesn't exist
		}
		var oldColor = rgbToHex( red, green, blue );
		var oldPixel = new window.Pixel( mouse.currentX, mouse.currentY, oldColor );

		// Register the changes for the undo/redo functionality
		user.oldPixels.splice( user.arrayPointer, user.oldPixels.length - user.arrayPointer, oldPixel );
		user.newPixels.splice( user.arrayPointer, user.newPixels.length - user.arrayPointer, newPixel );
		user.arrayPointer++;

		newPixel.paint().save();
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

	background: '#000000',

	/* Getters */

	getXpixels: function () {
		return Math.floor( board.width / board.pixelSize );
	},

	getYpixels: function () {
		return Math.floor( board.height / board.pixelSize );
	},

	getTopLeftX: function() {
		var topLeftX = parseInt( window.location.pathname.split('/').slice( -3, 1 ) );
		if ( topLeftX === parseInt( topLeftX ) ) {
			return topLeftX;
		}
		return board.topLeftX;
	},

	getTopLeftY: function() {
		var topLeftY = parseInt( window.location.pathname.split('/').slice( -2, 1 ) );
		if ( topLeftY === parseInt( topLeftY ) ) {
			return topLeftY;
		}
		return board.topLeftY;
	},

	getPixelSize: function() {
		var pixelSize = parseInt( window.location.pathname.split('/').slice( -1, 1 ) );
		if ( pixelSize === parseInt( pixelSize ) ) {
			return pixelSize;
		}
		return board.pixelSize;
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

	setBackground: function ( value ) {
		board.background = value;
		$( board.canvas ).css( 'background', value );
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

	setTopLeftX: function ( value ) {
		board.topLeftX = value;
		return board;
	},

	setTopLeftY: function ( value ) {
		board.topLeftY = value;
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
			'topLeftX': board.topLeftX,
			'topLeftY': board.topLeftY,
			'xPixels': board.xPixels,
			'yPixels': board.yPixels,
			'pixelSize': board.pixelSize
		};
		$.get( 'Ajax/getArea', data, function ( response ) {
			//console.log( response );
			var Pixel;
			for ( var i = 0; i < response.length; i++ ) {
				Pixel = new window.Pixel( response[ i ].x, response[ i ].y, response[ i ].color );
				Pixel.paint();
			}
			menu.setAlert( '' );

			// Update the URL of the browser
			var BASE = $( 'base' ).attr( 'href' );
			history.replaceState( null, null, BASE + board.topLeftX + '/' + board.topLeftY + '/' + board.pixelSize );

			// Update the URL of the Like and Share buttons
			FB.XFBML.parse();
		});
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
	}
}

grid = {

	canvas: {},

	context: {},

	color: '#555555',

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

/**
 * Pixel model
 */
function Pixel( x, y, color ) {
	/**
	 * The properties are identical to those of the PHP model and the database columns
	 */
	this.x = x;
	this.y = y;
	this.author_id = null;
	this.time = null;
	this.color = color;

	/**
	 * Getters
	 */
	this.get = function() {
		var thisPixel = this;
		$.get( 'Ajax/getPixel', this.getProperties(), function ( response ) {
			//console.log( response );
			for ( var property in response ) {
				thisPixel[ property ] = response[ property ];
			}
			//console.log( thisPixel );
			return thisPixel;
		});
	}

	this.getProperties = function() {
		return { 'x': this.x, 'y': this.y, 'color': this.color };
	}

	this.save = function () {
		var thisPixel = this;
		$.get( 'Ajax/savePixel', this.getProperties(), function ( response ) {
			console.log( response );
			// If the user wasn't allowed to paint the pixel, revert it
			if ( response.message === 'Not your pixel' ) {
				menu.setAlert( response.message, 1000 );
				thisPixel.color = response.Pixel.color;
				thisPixel.paint();
				// Remove the reverted pixel from the undo/redo arrays
				for ( var i in user.oldPixels ) {
					if ( user.oldPixels[ i ].x == response.Pixel.x && user.oldPixels[ i ].y == response.Pixel.y ) {
						user.oldPixels.splice( i, 1 );
						user.newPixels.splice( i, 1 );
						user.arrayPointer--;
					}
				}
			}
		});
		return this;
	}

	this.paint = function () {
		if ( this.color === null ) {
			return this.erase();
		}
		var rectX = ( this.x - board.topLeftX ) * board.pixelSize;
		var rectY = ( this.y - board.topLeftY ) * board.pixelSize;
		var rectW = board.pixelSize;
		var rectH = board.pixelSize;
		board.context.fillStyle = this.color;
		board.context.fillRect( rectX, rectY, rectW, rectH );
		return this;
	}

	this.shine = function () {
		if ( this.color === null ) {
			return this.erase();
		}
		var rectX = ( this.x - board.topLeftX ) * board.pixelSize;
		var rectY = ( this.y - board.topLeftY ) * board.pixelSize;
		var rectW = board.pixelSize;
		var rectH = board.pixelSize;
		board.context.fillStyle = '#ffffff';
		board.context.fillRect( rectX, rectY, rectW, rectH );
		return this;
	}

	this.erase = function () {
		var rectX = ( this.x - board.topLeftX ) * board.pixelSize;
		var rectY = ( this.y - board.topLeftY ) * board.pixelSize;
		var rectW = board.pixelSize;
		var rectH = board.pixelSize;
		board.context.clearRect( rectX, rectY, rectW, rectH );
		this.color = null;
		return this;
	}
}