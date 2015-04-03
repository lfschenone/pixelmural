$( function () {

	// Initialize Spectrum
	$( '.color-input' ).spectrum({
		preferredFormat: 'hex',
		showButtons: false,
		show: function ( color ) {
			menu.activeColor = color.toHexString();
			$( this ).next().addClass( 'active' ).siblings().removeClass( 'active' );
		},
		change: function ( color ) {
			menu.activeColor = color.toHexString();
		},
		hide: function ( color ) {
			menu.activeColor = color.toHexString();
		}
	});
	$( '.color-input:first-child' ).next().addClass( 'active' ); // Set the first color as active

	// Set the variables that must wait for the DOM to be loaded
	board.setCanvas( document.getElementById( 'board' ) );
	board.setContext( board.canvas.getContext( '2d' ) );
	board.setWidth( $( 'body' ).width() );
	board.setHeight( $( 'body' ).height() );
	board.setBackground( '#ffffff' );
	board.setCenterX( board.getCenterX() );
	board.setCenterY( board.getCenterY() );
	board.setPixelSize( board.getPixelSize() );
	grid.setCanvas( document.getElementById( 'grid' ) );
	grid.setContext( grid.canvas.getContext( '2d' ) );
	grid.setWidth( board.width );
	grid.setHeight( board.height );

	// Bind events
	$( '.menu button' ).mouseover( menu.onButtonMouseover ).mouseout( menu.onButtonMouseout );
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
	 * These properties match the table columns and the properties of the PHP model
	 */
	id: null,
	facebook_id: null,
	join_time: null,
	last_seen: null,
	pixel_count: 0,
	share_count: 0,
	name: null,
	email: null,
	gender: null,
	locale: null,
	link: null,
	status: null,
	timezone: null,

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
	},

	isAnon: function () {
		if ( user.status === 'anon' ) {
			return true;
		}
		return false;
	}
}

menu = {

	alert: '',

	activeColor: '#000000',

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
		mouse.dragAction = 'paintPixel2';
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

	onButtonMouseover: function ( event ) {
		var button = $( this ),
			title = button.attr( 'title' );
		if ( title ) {
			var tooltip = $( '<span/>' ).addClass( 'tooltip' ).text( title );
			button.append( tooltip );
		}
	},

	onButtonMouseout: function ( event ) {
		$( '.tooltip' ).remove();
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
	 * The distance from the origin of the coordinate system in virtual pixels (not real ones)
	 */
	currentX: null,
	currentY: null,

	previousX: null,
	previousY: null,

	state: 'up',

	downAction: null,
	dragAction: null,
	upAction: null,

	down: function ( event ) {
		mouse.state = 'down';
		mouse[ mouse.downAction ]( event );
		return mouse;
	},

	move: function ( event ) {
		mouse.previousX = mouse.currentX;
		mouse.previousY = mouse.currentY;

		mouse.currentX = board.centerX - Math.floor( board.xPixels / 2 ) + Math.floor( ( event.offsetX - 1 /* bugfix */ ) / board.pixelSize );
		mouse.currentY = board.centerY - Math.floor( board.yPixels / 2 ) + Math.floor( ( event.offsetY - 2 /* bugfix */ ) / board.pixelSize );

		// If the mouse is being dragged
		if ( mouse.state === 'down' && ( mouse.currentX !== mouse.previousX || mouse.currentY !== mouse.previousY ) && mouse.dragAction ) {
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
		board.centerX += mouse.previousX - mouse.currentX;
		board.centerY += mouse.previousY - mouse.currentY;

		mouse.diffX += ( mouse.currentX - mouse.previousX ) * board.pixelSize;
		mouse.diffY += ( mouse.currentY - mouse.previousY ) * board.pixelSize;

		board.clear();
		board.context.putImageData( board.imageData, mouse.diffX, mouse.diffY );

		// Bugfix: without this, the board flickers when moving
		mouse.currentX = board.centerX - Math.floor( board.xPixels / 2 ) + Math.floor( event.offsetX / board.pixelSize );
		mouse.currentY = board.centerY - Math.floor( board.yPixels / 2 ) + Math.floor( event.offsetY / board.pixelSize );

		return mouse;
	},

	moveBoard3: function ( event ) {
		if ( mouse.diffX || mouse.diffY ) {
			board.fill();
		}
		return mouse;
	},

	suckColor: function ( event ) {
		var imageData = board.context.getImageData( event.offsetX, event.offsetY, 1, 1 );
			red   = imageData.data[0],
			green = imageData.data[1],
			blue  = imageData.data[2],
			alpha = imageData.data[3],
			menu.activeColor = alpha ? rgb2hex( red, green, blue ) : board.background;
		$( '.sp-replacer.active' ).prev().spectrum( 'set', menu.activeColor );
		return mouse;
	},

	getInfo: function ( event ) {
		var data = { 'x': mouse.currentX, 'y': mouse.currentY };
		$.get( 'ajax.php?method=getInfo', data, function ( response ) {
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
		var oldPixel = board.getPixel( mouse.currentX, mouse.currentY ),
			newPixel = new window.Pixel({ 'x': mouse.currentX, 'y': mouse.currentY, 'color': menu.activeColor });

		// For convenience, re-painting a pixel erases it
		if ( newPixel.color === oldPixel.color && mouse.currentX === mouse.previousX && mouse.currentY === mouse.previousY ) {
			newPixel.color = null;
		}

		// Register the changes for the undo/redo functionality
		user.register( oldPixel, newPixel );

		newPixel.paint().save();
		return mouse;
	},

	/**
	 * Paint a single pixel, part two
	 */
	paintPixel2: function ( event ) {
		if ( user.isAnon() ) {
			return mouse; // Anons can't drag
		}
		return mouse.paintPixel();
	},

	/**
	 * Erase a single pixel
	 */
	erasePixel: function ( event ) {
		var oldPixel = board.getPixel( mouse.currentX, mouse.currentY );

		if ( oldPixel.color === null ) {
			return mouse; // The pixel doesn't exist, no need to continue
		}

		var newPixel = new window.Pixel({ 'x': mouse.currentX, 'y': mouse.currentY });

		// Register the changes for the undo/redo functionality
		user.register( oldPixel, newPixel );

		newPixel.erase().save();
		return mouse;
	},

	paintArea: function ( event ) {
		var data = { 'x': mouse.currentX, 'y': mouse.currentY, 'color': menu.activeColor };
		$.get( 'ajax.php?method=paintArea', data, function ( response ) {
			console.log( response );
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

	width: 600,
	height: 300,

	centerX: 0,
	centerY: 0,

	pixelSize: 2,

	xPixels: 60,
	yPixels: 30,

	background: null,

	/* Getters */

	getXpixels: function () {
		return Math.floor( board.width / board.pixelSize );
	},

	getYpixels: function () {
		return Math.floor( board.height / board.pixelSize );
	},

	getCenterX: function() {
		var centerX = parseInt( window.location.pathname.split('/').slice( -3, -2 ) );
		if ( !isNaN( centerX ) ) {
			return centerX;
		}
		return board.centerX;
	},

	getCenterY: function() {
		var centerY = parseInt( window.location.pathname.split('/').slice( -2, -1 ) );
		if ( !isNaN( centerY ) ) {
			return centerY;
		}
		return board.centerY;
	},

	getPixelSize: function() {
		var pixelSize = parseInt( window.location.pathname.split('/').slice( -1 ) );
		if ( !isNaN( pixelSize ) ) {
			return pixelSize;
		}
		return board.pixelSize;
	},

	/**
	 * Builds a basic pixel object out of the coordinates and the color,
	 * but sucks the color directly from the canvas (not the database)
	 * so it only works for visible pixels
	 */
	getPixel: function ( x, y ) {
		var rectX = Math.abs( board.centerX - Math.floor( board.xPixels / 2 ) - x ) * board.pixelSize,
			rectY = Math.abs( board.centerY - Math.floor( board.yPixels / 2 ) - y ) * board.pixelSize,
			imageData = board.context.getImageData( rectX, rectY, 1, 1 ),
			red   = imageData.data[0],
			green = imageData.data[1],
			blue  = imageData.data[2],
			alpha = imageData.data[3],
			color = alpha ? rgb2hex( red, green, blue ) : null,
			Pixel = new window.Pixel({ 'x': x, 'y': y, 'color': color });
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

	setCenterX: function ( value ) {
		board.centerX = value;
		return board;
	},

	setCenterY: function ( value ) {
		board.centerY = value;
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
		if ( board.pixelSize === 64 ) {
			return board;
		}
		board.setPixelSize( board.pixelSize * 2 );
		board.refill();
		return board;
	},

	zoomOut: function () {
		if ( board.pixelSize === 1 ) {
			return board;
		}
		board.setPixelSize( board.pixelSize / 2 );
		board.refill();
		return board;
	},

	fill: function () {
		menu.setAlert( 'Loading pixels, please wait...' );

		var x1 = board.centerX - board.xPixels / 2, // Math.ceil() or Math.floor() ?
			y1 = board.centerY - board.yPixels / 2,
			x2 = board.centerX + board.xPixels / 2,
			y2 = board.centerY + board.yPixels / 2,
			data = { 'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2 };

		$.get( 'ajax.php?method=getArea', data, function ( response ) {
			//console.log( response );
			var i,
				pixelData,
				Pixel;
			for ( i = 0; i < response.length; i += 3 ) {
				pixelData = { 'x': response[ i ], 'y': response[ i + 1 ], 'color': response[ i + 2 ] };
				Pixel = new window.Pixel( pixelData );
				Pixel.paint();
			}
			$( '#alert' ).hide();

			// Update the URL of the browser
			var BASE = $( 'base' ).attr( 'href' );
			history.replaceState( null, null, BASE + board.centerX + '/' + board.centerY + '/' + board.pixelSize );
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
			menu.setAlert( 'Pixels are too small for the grid', 1000 );
			return grid;
		}
		grid.context.beginPath();
		for ( var x = 0; x <= board.xPixels; x++ ) {
			grid.context.moveTo( x * board.pixelSize - 0.5, 0 ); // The 0.5 avoids getting blury lines
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

	this.fetch = function () {
		var data = { 'x': this.x, 'y': this.y };
		$.get( 'ajax.php?method=fetchPixel', data, function ( response ) {
			//console.log( response );
			return new window.Pixel( response );
		});
	}

	this.save = function () {
		var data = { 'x': this.x, 'y': this.y, 'color': this.color };
		$.get( 'ajax.php?method=savePixel', data, function ( response ) {
			//console.log( response );
			// If the user wasn't allowed to paint the pixel, revert it
			if ( response.message === 'Not your pixel' ) {
				// Repaint the pixel
				var oldPixel = new window.Pixel( response.Pixel );
				oldPixel.paint();

				// Display the author of the pixel
				var picture = '<img src="images/anon.png" />',
					author = response.Author.name;
				if ( response.Author.facebook_id ) {
					picture = '<img src="http://graph.facebook.com/' + response.Author.facebook_id + '/picture" />';
					author = '<a href="' + response.Author.link + '">' + response.Author.name + '</a>';
				}
				var age = roundSeconds( Math.floor( Date.now() / 1000 ) - response.Pixel.time );
				menu.setAlert( picture + '<p>By ' + author + '</p><p>' + age + ' ago</p>', 4000 );

				// Remove the reverted pixel from the undo/redo arrays
				for ( var i = 0; i < user.oldPixels.length; i++ ) {
					if ( user.oldPixels[ i ].x === oldPixel.x && user.oldPixels[ i ].y === oldPixel.y ) {
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
		var rectX = Math.abs( board.centerX - Math.floor( board.xPixels / 2 ) - this.x ) * board.pixelSize,
			rectY = Math.abs( board.centerY - Math.floor( board.yPixels / 2 ) - this.y ) * board.pixelSize,
			rectW = board.pixelSize,
			rectH = board.pixelSize;
		board.context.fillStyle = this.color;
		board.context.fillRect( rectX, rectY, rectW, rectH );
		return this;
	}

	this.erase = function () {
		var rectX = Math.abs( board.centerX - Math.floor( board.xPixels / 2 ) - this.x ) * board.pixelSize,
			rectY = Math.abs( board.centerY - Math.floor( board.yPixels / 2 ) - this.y ) * board.pixelSize,
			rectW = board.pixelSize,
			rectH = board.pixelSize;
		board.context.clearRect( rectX, rectY, rectW, rectH );
		this.color = null;
		return this;
	}
}