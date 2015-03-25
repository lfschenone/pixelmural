$( function () {

	// Initialize Spectrum
	$( '#color-input' ).spectrum({
		preferredFormat: 'hex',
		showButtons: false,
		move: function ( color ) {
			menu.setColor( color.toHexString() );
		}
	});

	// Set the variables that must wait for the DOM to be loaded
	board.setCanvas( document.getElementById( 'board' ) );
	board.setContext( board.canvas.getContext( '2d' ) );
	board.setWidth( $( 'body' ).width() );
	board.setHeight( $( 'body' ).height() );
	board.setBackground( '#ffffff' );
	board.setTopLeftX( board.getTopLeftX() );
	board.setTopLeftY( board.getTopLeftY() );
	board.setPixelSize( board.getPixelSize() );
	grid.setCanvas( document.getElementById( 'grid' ) );
	grid.setContext( grid.canvas.getContext( '2d' ) );
	grid.setWidth( board.width );
	grid.setHeight( board.height );

	// Bind events
	$( '.menu button' ).mouseover( menu.onButtonMouseover ).mouseout( menu.onButtonMouseout );
	$( '.menu .sp-preview' ).mouseover( menu.onColorInputMouseover ).mouseout( menu.onColorInputMouseout );
	$( '#board' ).mousedown( mouse.down ).mousemove( mouse.move ).mouseup( mouse.up );
	$( '#grid-button' ).click( menu.onGridButtonClick );
	$( '#zoom-in-button' ).click( menu.onZoomInButtonClick );
	$( '#zoom-out-button' ).click( menu.onZoomOutButtonClick );
	$( '#undo-button' ).click( menu.onUndoButtonClick );
	$( '#redo-button' ).click( menu.onRedoButtonClick );
	$( '#info-button' ).click( menu.onInfoButtonClick );
	$( '#move-button' ).click( menu.onMoveButtonClick );
	$( '#eyedrop-button' ).click( menu.onEyedropButtonClick );
	$( '#pencil-button' ).click( menu.onPencilButtonClick );
	$( '#bucket-button' ).click( menu.onBucketButtonClick );
	$( '#eraser-button' ).click( menu.onEraserButtonClick );
	$( document ).keydown( keyboard.onKeydown );
	$( document ).keyup( keyboard.onKeyup );

	// Set 'Move' as the default action
	$( '#move-button' ).click();

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

	register: function ( oldPixel, newPixel ) {
		user.oldPixels.splice( user.arrayPointer, user.oldPixels.length - user.arrayPointer, oldPixel );
		user.newPixels.splice( user.arrayPointer, user.newPixels.length - user.arrayPointer, newPixel );
		user.arrayPointer++;
	},

	undo: function () {
		if ( user.arrayPointer === 0 ) {
			return false;
		}
		user.arrayPointer--;
		var oldPixel = user.oldPixels[ user.arrayPointer ];
		if ( $.isArray( oldPixel ) ) {
			oldPixel.forEach( function ( Pixel ) {
				Pixel.paint().save();
			});
		} else {
			oldPixel.paint().save();
		}
	},

	redo: function () {
		if ( user.arrayPointer === user.newPixels.length ) {
			return false;
		}
		var newPixel = user.newPixels[ user.arrayPointer ];
		user.arrayPointer++;
		if ( $.isArray( newPixel ) ) {
			newPixel.forEach( function ( Pixel ) {
				Pixel.paint().save();
			});
		} else {
			newPixel.paint().save();
		}
	}
}

menu = {

	alert: '',

	color: '#000000',

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
		$( '#info-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'getInfo';
		mouse.dragAction = null;
		mouse.upAction = null;
	},

	onMoveButtonClick: function ( event ) {
		$( '#board' ).css( 'cursor', 'move' );
		$( '#move-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'moveBoard1';
		mouse.dragAction = 'moveBoard2';
		mouse.upAction = 'moveBoard3';
	},

	onEyedropButtonClick: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#eyedrop-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'suckColor';
		mouse.dragAction = 'suckColor';
		mouse.upAction = null;
	},

	onPencilButtonClick: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#pencil-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'paintPixel';
		mouse.dragAction = 'paintPixel';
		mouse.upAction = null;
	},

	onBucketButtonClick: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#bucket-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'paintArea';
		mouse.dragAction = null;
		mouse.upAction = null;
	},

	onEraserButtonClick: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#eraser-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'erasePixel';
		mouse.dragAction = 'erasePixel';
		mouse.upAction = null;
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
		if ( title ) {
			var tooltip = $( '<span/>' ).addClass( 'tooltip' ).text( title );
			button.append( tooltip );
		}
	},

	onButtonMouseout: function ( event ) {
		$( '.tooltip' ).remove();
	},

	setColor: function ( color ) {
		menu.color = color;
		$( '#color-input' ).spectrum( 'set', color );
	},

	setAlert: function ( html, duration ) {
		$( '#alert' ).html( html ).show();
		if ( duration ) {
			window.setTimeout( function () {
				$( '#alert' ).hide();
			}, duration );
		}
	}
}

keyboard = {

	onKeydown: function ( event ) {
		// Alt
		if ( event.keyCode === 18 ) {
			$( '#eyedrop-button' ).click();
		}
		// Spacebar
		if ( event.keyCode === 32 ) {
			$( '#move-button' ).click();
		}
		// A
		if ( event.keyCode === 65 ) {
			$( '#info-button' ).click();
		}
		// B
		if ( event.keyCode === 66 ) {
			$( '#bucket-button' ).click();
		}
		// E
		if ( event.keyCode === 69 ) {
			$( '#eraser-button' ).click();
		}
		// G
		if ( event.keyCode === 71 ) {
			$( '#grid-button' ).click();
		}
		// I
		if ( event.keyCode === 73 ) {
			$( '#zoom-in-button' ).click();
		}
		// O
		if ( event.keyCode === 79 ) {
			$( '#zoom-out-button' ).click();
		}
		// P
		if ( event.keyCode === 80 ) {
			$( '#pencil-button' ).click();
		}
		// X
		if ( event.keyCode === 88 ) {
			$( '#redo-button' ).click();
		}
		// Z
		if ( event.keyCode === 90 ) {
			$( '#undo-button' ).click();
		}
	},

	onKeyup: function ( event ) {
		// Alt
		if ( event.keyCode === 18 ) {
			$( '#pencil-button' ).click();
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

		mouse.currentX = board.topLeftX + Math.floor( ( event.pageX - board.canvas.offsetLeft - 1 ) / board.pixelSize ); // - 1 is a bugfix
		mouse.currentY = board.topLeftY + Math.floor( ( event.pageY - board.canvas.offsetTop - 2 ) / board.pixelSize ); // - 2 is a bugfix

		// If the mouse is being dragged
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

		board.clear();
		board.context.putImageData( board.imageData, mouse.diffX, mouse.diffY );

		// Bug fix
		mouse.currentX = board.topLeftX + Math.floor( ( event.pageX - board.canvas.offsetLeft - 1 ) / board.pixelSize );
		mouse.currentY = board.topLeftY + Math.floor( ( event.pageY - board.canvas.offsetTop - 2 ) / board.pixelSize );

		return mouse;
	},

	moveBoard3: function ( event ) {
		if ( mouse.diffX || mouse.diffY ) {
			board.fill();
		}
		return mouse;
	},

	suckColor: function ( event ) {
		var Pixel = board.getPixel( mouse.currentX, mouse.currentY );
		if ( Pixel.color ) {
			menu.setColor( Pixel.color );
		} else {
			menu.setColor( board.background );
		}
		return mouse;
	},

	getInfo: function ( event ) {
		var data = { 'x': mouse.currentX, 'y': mouse.currentY };
		$.get( 'Ajax/getInfo', data, function ( response ) {
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
	 */
	paintPixel: function ( event ) {
		var oldPixel = board.getPixel( mouse.currentX, mouse.currentY );
		var newPixel = new window.Pixel({ 'x': mouse.currentX, 'y': mouse.currentY, 'color': menu.color });

		// Register the changes for the undo/redo functionality
		user.register( oldPixel, newPixel );

		// For convenience, re-painting a pixel erases it
		if ( newPixel.color === oldPixel.color ) {
			//newPixel.color = null;
		}

		newPixel.paint().save();
		return mouse;
	},

	/**
	 * Erase a single pixel
	 */
	erasePixel: function ( event ) {
		var oldPixel = board.getPixel( mouse.currentX, mouse.currentY );
		var newPixel = new window.Pixel({ 'x': mouse.currentX, 'y': mouse.currentY });

		// Register the changes for the undo/redo functionality
		user.register( oldPixel, newPixel );

		newPixel.erase().save();
		return mouse;
	},

	paintArea: function ( event ) {
		var data = { 'x': mouse.currentX, 'y': mouse.currentY, 'color': menu.color };
		$.get( 'Ajax/paintArea', data, function ( response ) {
			//console.log( response );
			if ( response.message === 'Not your pixel' ) {
				menu.setAlert( response.message, 1000 );
			}
			if ( response.message === 'Area painted' ) {
				var newData,
					newPixel,
					newPixels = [],
					oldData,
					oldPixel,
					oldPixels = [];
				for ( var i = 0; i < response.newData.length; i++ ) {
					newData = response.newData[ i ];
					newPixel = new window.Pixel( newData );
					newPixel.paint();
					newPixels.push( newPixel );

					oldData = response.oldData[ i ];
					oldPixel = new window.Pixel( oldData );
					oldPixels.push( oldPixel );
				}
				// Register the changes for the undo/redo functionality
				user.register( oldPixels, newPixels );
			}
		});
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

	background: null,

	/* Getters */

	getXpixels: function () {
		return Math.floor( board.width / board.pixelSize );
	},

	getYpixels: function () {
		return Math.floor( board.height / board.pixelSize );
	},

	getTopLeftX: function() {
		var topLeftX = parseInt( window.location.pathname.split('/').slice( -3, -2 ) );
		if ( !isNaN( topLeftX ) ) {
			return topLeftX;
		}
		return board.topLeftX;
	},

	getTopLeftY: function() {
		var topLeftY = parseInt( window.location.pathname.split('/').slice( -2, -1 ) );
		if ( !isNaN( topLeftY ) ) {
			return topLeftY;
		}
		return board.topLeftY;
	},

	getPixelSize: function() {
		var pixelSize = parseInt( window.location.pathname.split('/').slice( -1 ) );
		if ( !isNaN( pixelSize ) ) {
			return pixelSize;
		}
		return board.pixelSize;
	},

	getPixel: function ( x, y ) {
		var imageData = board.context.getImageData( x * board.pixelSize, y * board.pixelSize, 1, 1 );
		var red   = imageData.data[0];
		var green = imageData.data[1];
		var blue  = imageData.data[2];
		var alpha = imageData.data[3];
		var color = alpha ? rgbToHex( red, green, blue ) : null;
		var Pixel = new window.Pixel({ 'x': x, 'y': y, 'color': color });
		return Pixel;
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
			board.pixelSize = 64; // Max pixel size
		}
		if ( board.pixelSize < 1 ) {
			board.pixelSize = 1; // Min pixel size
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
			var i,
				pixelsData = response.slice( 0, -1 ).split( ';' ),
				pixelData,
				Pixel;
			for ( i = 0; i < pixelsData.length; i++ ) {
				pixelData = pixelsData[ i ].split( ',' );
				pixelData = { 'x': pixelData[0], 'y': pixelData[1], 'color': pixelData[2] };
				Pixel = new window.Pixel( pixelData );
				Pixel.paint();
			}
			$( '#alert' ).hide();

			// Update the URL of the browser
			var BASE = $( 'base' ).attr( 'href' );
			history.replaceState( null, null, BASE + board.topLeftX + '/' + board.topLeftY + '/' + board.pixelSize );
		});
		return board;
	},

	clear: function () {
		board.context.clearRect( 0, 0, board.canvas.width, board.canvas.height );
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

	clear: function () {
		grid.context.clearRect( 0, 0, grid.canvas.width, grid.canvas.height );
	},

	show: function () {
		grid.visible = true;
		if ( board.pixelSize < 4 ) {
			return grid; // If the pixels are too small, don't draw the grid
		}
		grid.context.beginPath();
		for ( var x = 0; x <= board.xPixels; x++ ) {
			grid.context.moveTo( x * board.pixelSize - 0.5, 0 ); // The 0.5 is to avoid getting blury lines
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
		grid.clear();
		return grid;
	},

	toggle: function () {
		grid.visible ? grid.hide() : grid.show();
		return grid;
	}
}

/**
 * Pixel model
 */
function Pixel( data ) {
	/**
	 * The properties are identical to those of the PHP model and the database columns
	 */
	this.x = 'x' in data ? data.x : null;
	this.y = 'y' in data ? data.y : null;
	this.author_id = 'author_id' in data ? data.author_id : null;
	this.time = 'time' in data ? data.time : null;
	this.color = 'color' in data ? data.color : null;

	this.get = function () {
		$.get( 'Ajax/getPixel', this, function ( response ) {
			//console.log( response );
			return new window.Pixel( response );
		});
	}

	this.save = function () {
		var data = { 'x': this.x, 'y': this.y, 'color': this.color };
		$.get( 'Ajax/savePixel', data, function ( response ) {
			//console.log( response );
			// If the user wasn't allowed to paint the pixel, revert it
			if ( response.message === 'Not your pixel' ) {
				// Repaint the pixel
				var oldPixel = new window.Pixel( response.Pixel );
				oldPixel.paint();

				// Display the author of the pixel
				var picture = '<img src="images/anon.jpg" />'
				var author = response.Author.name;
				if ( response.Author.facebook_id ) {
					picture = '<img class="picture" src="http://graph.facebook.com/' + response.Author.facebook_id + '/picture" />'
					author = '<a href="' + response.Author.link + '">' + response.Author.name + '</a>';
				}
				var age = roundSeconds( Math.floor( Date.now() / 1000 ) - response.Pixel.time );
				menu.setAlert( picture + '<div class="author">By ' + author + '</div><div class="age">' + age + ' ago</div>' );

				// Remove the reverted pixel from the undo/redo arrays
				for ( var i = 0; i < user.oldPixels.length; i++ ) {
					if ( user.oldPixels[ i ].x == oldPixel.x && user.oldPixels[ i ].y == oldPixel.y ) {
						user.oldPixels.splice( i, 1 );
						user.newPixels.splice( i, 1 );
						user.arrayPointer--;
					}
				}
			}
		});
		return this;
	}

	this.info = function () {
		
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