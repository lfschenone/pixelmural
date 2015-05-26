$( function () {

	// Initialise the global user
	gUser = new User;

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
	}).first().next().addClass( 'active' ); // Set the first color as active

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
	$( '#board' ).mousedown( mouse.down ).mousemove( mouse.move ).mouseup( mouse.up );
	$( '#grid-button' ).click( menu.clickGridButton );
	$( '#zoom-in-button' ).click( menu.clickZoomInButton );
	$( '#zoom-out-button' ).click( menu.clickZoomOutButton );
	$( '#undo-button' ).click( menu.clickUndoButton );
	$( '#redo-button' ).click( menu.clickRedoButton );
	$( '#info-button' ).click( menu.clickInfoButton );
	$( '#move-button' ).click( menu.clickMoveButton );
	$( '#dropper-button' ).click( menu.clickDropperButton );
	$( '#pencil-button' ).click( menu.clickPencilButton );
	$( '#brush-button' ).click( menu.clickBrushButton );
	$( '#bucket-button' ).click( menu.clickBucketButton );
	$( '#eraser-button' ).click( menu.clickEraserButton );
	$( '.menu button' ).mouseover( menu.showTooltip ).mouseout( menu.hideTooltip ).click( menu.updateButtons );
	$( document ).keydown( keyboard.keydown );
	$( document ).keyup( keyboard.keyup );

	// Set 'Move' as the default action
	$( '#move-button' ).click();

	// Fill the board
	board.fill();
});

menu = {

	alert: '',

	activeColor: '#000000',

	showTooltip: function ( event ) {
		var button = $( event.target );
		var tooltip = button.attr( 'data-tooltip' );
		if ( tooltip ) {
			var span = $( '<span/>' ).addClass( 'tooltip' ).text( tooltip );
			button.append( span );
		}
	},

	hideTooltip: function ( event ) {
		$( '.tooltip' ).remove();
	},

	clickGridButton: function ( event ) {
		grid.toggle();
	},

	clickZoomInButton: function ( event ) {
		board.zoomIn();
	},

	clickZoomOutButton: function ( event ) {
		board.zoomOut();
	},

	clickUndoButton: function ( event ) {
		board.undo();
	},

	clickRedoButton: function ( event ) {
		board.redo();
	},

	clickInfoButton: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#info-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'getInfo';
		mouse.dragAction = null;
		mouse.upAction = null;
	},

	clickMoveButton: function ( event ) {
		$( '#board' ).css( 'cursor', 'move' );
		$( '#move-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'moveBoard1';
		mouse.dragAction = 'moveBoard2';
		mouse.upAction = 'moveBoard3';
	},

	clickDropperButton: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#dropper-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'suckColor';
		mouse.dragAction = 'suckColor';
		mouse.upAction = null;
	},

	clickPencilButton: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#pencil-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'paintPixel';
		mouse.dragAction = null;
		mouse.upAction = null;
	},

	clickBrushButton: function ( event ) {
		if ( $( '#brush-button' ).hasClass( 'disabled' ) ) {
			return; // There should be a server-side check
		}
		$( '#board' ).css( 'cursor', 'default' );
		$( '#brush-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'paintPixel';
		mouse.dragAction = 'paintPixel';
		mouse.upAction = null;
	},

	clickBucketButton: function ( event ) {
		if ( $( '#bucket-button' ).hasClass( 'disabled' ) ) {
			return; // There should be a server-side check
		}
		$( '#board' ).css( 'cursor', 'default' );
		$( '#bucket-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'paintArea';
		mouse.dragAction = null;
		mouse.upAction = null;
	},

	clickEraserButton: function ( event ) {
		$( '#board' ).css( 'cursor', 'default' );
		$( '#eraser-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'erasePixel';
		mouse.dragAction = 'erasePixel';
		mouse.upAction = null;
	},

	showAlert: function ( html, duration ) {
		$( '#alert' ).html( html ).show();
		if ( duration ) {
			window.setTimeout( function () {
				$( '#alert' ).hide();
			}, duration );
		}
	},

	showPixelAuthor: function ( Pixel, Author ) {
		var picture = '<img src="images/anon.png" />',
			author = Author.name,
			age = roundSeconds( Math.floor( Date.now() / 1000 ) - Pixel.insert_time );
		if ( !Author.isAnon() ) {
			picture = '<img src="http://graph.facebook.com/' + Author.facebook_id + '/picture" />';
			author = '<a target="_blank" href="' + Author.link + '">' + Author.name + '</a>';
		}
		menu.showAlert( picture + '<p>By ' + author + '</p><p>' + age + ' ago</p>', 4000 );
	},

	/**
	 * Update the status of each button
	 */
	updateButtons: function () {
		// First reset everything
		$( '.menu button' ).removeClass( 'disabled' ).removeAttr( 'data-tooltip' );

		if ( board.pixelSize === 1 ) {
			$( '#zoom-out-button' ).addClass( 'disabled' );
		}

		if ( board.pixelSize === 64 ) {
			$( '#zoom-in-button' ).addClass( 'disabled' );
		}

		if ( board.arrayPointer === 0 ) {
			$( '#undo-button' ).addClass( 'disabled' );
		}

		if ( board.arrayPointer === board.newPixels.length ) {
			$( '#redo-button' ).addClass( 'disabled' );
		}

		if ( board.pixelSize < 4 ) {
			$( '#grid-button' ).addClass( 'disabled' );
		}

		if ( gUser.status === 'anon' ) {
			$( '#brush-button' ).addClass( 'disabled' );
		}

		$( '.sp-replacer.active' ).prev().spectrum( 'set', menu.activeColor );
	}
}

keyboard = {

	keydown: function ( event ) {
		// Alt
		if ( event.keyCode === 18 ) {
			menu.clickDropperButton();
		}
		// Spacebar
		if ( event.keyCode === 32 ) {
			menu.clickMoveButton();
		}
		// A
		if ( event.keyCode === 65 ) {
			menu.clickInfoButton();
		}
		// B
		if ( event.keyCode === 66 ) {
			menu.clickBucketButton();
		}
		// E
		if ( event.keyCode === 69 ) {
			menu.clickEraserButton();
		}
		// G
		if ( event.keyCode === 71 ) {
			menu.clickGridButton();
		}
		// I
		if ( event.keyCode === 73 ) {
			menu.clickZoomInButton();
		}
		// O
		if ( event.keyCode === 79 ) {
			menu.clickZoomOutButton();
		}
		// P
		if ( event.keyCode === 80 ) {
			menu.clickPencilButton();
		}
		// X
		if ( event.keyCode === 88 ) {
			menu.clickRedoButton();
		}
		// Z
		if ( event.keyCode === 90 ) {
			menu.clickUndoButton();
		}
	},

	keyup: function ( event ) {
		// Alt
		if ( event.keyCode === 18 ) {
			menu.clickPencilButton();
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

	getCurrentX: function ( event ) {
		var offsetX = event.pageX - $( event.target ).offset().left - 1; // The -1 is to correct a minor displacement
		var currentX = board.centerX - Math.floor( board.xPixels / 2 ) + Math.floor( offsetX / board.pixelSize );
		return currentX;
	},

	getCurrentY: function ( event ) {
		var offsetY = event.pageY - $( event.target ).offset().top - 2; // The -2 is to correct a minor displacement
		var currentY = board.centerY - Math.floor( board.yPixels / 2 ) + Math.floor( offsetY / board.pixelSize );
		return currentY;
	},

	down: function ( event ) {
		mouse.state = 'down';
		mouse[ mouse.downAction ]( event );
	},

	move: function ( event ) {
		mouse.previousX = mouse.currentX;
		mouse.previousY = mouse.currentY;

		mouse.currentX = mouse.getCurrentX( event );
		mouse.currentY = mouse.getCurrentY( event );

		// If the mouse is being dragged
		if ( mouse.state === 'down' && ( mouse.currentX !== mouse.previousX || mouse.currentY !== mouse.previousY ) && mouse.dragAction ) {
			mouse[ mouse.dragAction ]( event );
		}
	},

	up: function ( event ) {
		mouse.state = 'up';
		if ( mouse.upAction ) {
			mouse[ mouse.upAction ]( event );
		}
	},

	moveBoard1: function ( event ) {
		mouse.diffX = 0;
		mouse.diffY = 0;
		board.imageData = board.context.getImageData( 0, 0, board.width, board.height );
	},

	moveBoard2: function ( event ) {
		board.centerX += mouse.previousX - mouse.currentX;
		board.centerY += mouse.previousY - mouse.currentY;

		mouse.diffX += ( mouse.currentX - mouse.previousX ) * board.pixelSize;
		mouse.diffY += ( mouse.currentY - mouse.previousY ) * board.pixelSize;

//console.log( mouse, mouse.previousX, mouse.currentX, board, board.centerX, board.pixelSize, mouse.diffX )

		board.clear();
		board.context.putImageData( board.imageData, parseFloat( mouse.diffX ), parseFloat( mouse.diffY ) );

		// Bugfix: without this, the board flickers when moving
		mouse.currentX = mouse.getCurrentX( event );
		mouse.currentY = mouse.getCurrentY( event );
	},

	moveBoard3: function ( event ) {
		if ( mouse.diffX || mouse.diffY ) {
			board.fill();
		}
	},

	suckColor: function ( event ) {
		var imageData = board.context.getImageData( event.offsetX, event.offsetY, 1, 1 );
			red   = imageData.data[0],
			green = imageData.data[1],
			blue  = imageData.data[2],
			alpha = imageData.data[3];
		menu.activeColor = alpha ? rgb2hex( red, green, blue ) : board.background;
	},

	getInfo: function ( event ) {
		var data = { 'x': mouse.currentX, 'y': mouse.currentY };
		$.get( 'pixels', data, function ( response ) {
			//console.log( response );
			if ( response.Pixel ) {
				var Pixel = new window.Pixel( response.Pixel );
				var Author = new window.User( response.Author );
				menu.showPixelAuthor( Pixel, Author );
			}
		});
	},

	/**
	 * Paint a single pixel
	 */
	paintPixel: function ( event ) {
		var oldPixel = board.getPixel( mouse.currentX, mouse.currentY ),
			newPixel = new Pixel({ 'x': mouse.currentX, 'y': mouse.currentY, 'color': menu.activeColor });

		if ( newPixel.color === oldPixel.color && mouse.currentX === mouse.previousX && mouse.currentY === mouse.previousY ) {
			newPixel.color = null; // For convenience, re-painting a pixel erases it
		}

		newPixel.paint().save().register( oldPixel );
	},

	/**
	 * Erase a single pixel
	 */
	erasePixel: function ( event ) {
		var oldPixel = board.getPixel( mouse.currentX, mouse.currentY );

		if ( oldPixel.color === null ) {
			return; // The pixel doesn't exist, no need to continue
		}

		var newPixel = new Pixel({ 'x': mouse.currentX, 'y': mouse.currentY });

		newPixel.erase().save().register( oldPixel );
	},

	paintArea: function ( event ) {
		var data = { 'x': mouse.currentX, 'y': mouse.currentY, 'color': menu.activeColor };
		console.log( data );
		$.post( 'areas', data, function ( response ) {
			console.log( response );
			if ( response.message === 'Not your pixel' ) {
				var Pixel = new window.Pixel( response.Pixel );
				var Author = new window.User( response.Author );
				menu.showPixelAuthor( Pixel, Author );
			}

			if ( response.message === 'Area painted' ) {
				var newArea = new window.Area,
					newPixelData,
					newPixel,
					oldArea = new window.Area,
					oldPixelData,
					oldPixel;
				for ( var i = 0; i < response.newAreaData.length; i++ ) {
					newPixelData = response.newAreaData[ i ];
					newPixel = new window.Pixel( newPixelData );
					newArea.pixels.push( newPixel );

					oldPixelData = response.oldAreaData[ i ];
					oldPixel = new window.Pixel( oldPixelData );
					oldArea.pixels.push( oldPixel );
				}
				newArea.paint().register( oldArea );
			}
		});
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
	},

	setContext: function ( value ) {
		board.context = value;
	},

	setBackground: function ( value ) {
		board.background = value;
		$( board.canvas ).css( 'background', value );
	},

	setWidth: function ( value ) {
		board.width = value;
		board.canvas.setAttribute( 'width', value );
		board.xPixels = board.getXpixels();
	},

	setHeight: function ( value ) {
		board.height = value;
		board.canvas.setAttribute( 'height', value );
		board.yPixels = board.getYpixels();
	},

	setCenterX: function ( value ) {
		board.centerX = value;
	},

	setCenterY: function ( value ) {
		board.centerY = value;
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
	},

	/* Methods */

	/**
	 * Undo/redo functionality
	 */
	oldPixels: [],
	newPixels: [],
	arrayPointer: 0,

	undo: function () {
		if ( board.arrayPointer === 0 ) {
			return;
		}
		board.arrayPointer--;
		var oldPixels = board.oldPixels[ board.arrayPointer ];
		oldPixels.paint().save();
	},

	redo: function () {
		if ( board.arrayPointer === board.newPixels.length ) {
			return;
		}
		var newPixels = board.newPixels[ board.arrayPointer ];
		board.arrayPointer++;
		newPixels.paint().save();
	},

	zoomIn: function () {
		if ( board.pixelSize === 64 ) {
			return;
		}
		board.setPixelSize( board.pixelSize * 2 );
		board.fill();
	},

	zoomOut: function () {
		if ( board.pixelSize === 1 ) {
			return;
		}
		board.setPixelSize( board.pixelSize / 2 );
		board.fill();
	},

	fill: function () {
		menu.showAlert( 'Loading pixels, please wait...' );
		var data = {
			'width': board.width,
			'height': board.height,
			'centerX': board.centerX,
			'centerY': board.centerY,
			'pixelSize': board.pixelSize,
			'format': 'base64'
		};
		$.get( 'areas', data, function ( response ) {
			//console.log( response );
			var image = new Image();
			image.src = "data:image/png;base64," + response;
			image.onload = function () {
				board.clear();
				board.context.drawImage( image, 0, 0 );
				grid.toggle().toggle();
			}
			$( '#alert' ).hide();

			// Update the URL of the browser
			var BASE = $( 'base' ).attr( 'href' );
			history.replaceState( null, null, BASE + board.centerX + '/' + board.centerY + '/' + board.pixelSize );
		});
	},

	clear: function () {
		board.context.clearRect( 0, 0, board.width, board.height );
	}
}

grid = {

	canvas: {},
	context: {},

	color: '#ddd',

	visible: false,

	setCanvas: function ( value ) {
		grid.canvas = value
	},

	setContext: function ( value ) {
		grid.context = value
	},

	setWidth: function ( value ) {
		grid.width = value;
		grid.canvas.setAttribute( 'width', value );
	},

	setHeight: function ( value ) {
		grid.height = value;
		grid.canvas.setAttribute( 'height', value );
	},

	clear: function () {
		grid.context.clearRect( 0, 0, grid.canvas.width, grid.canvas.height );
	},

	show: function () {
		grid.visible = true;
		if ( board.pixelSize < 4 ) {
			return; // Pixels are too small for the grid
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
	},

	hide: function () {
		grid.visible = false;
		grid.clear();
	},

	toggle: function () {
		grid.visible ? grid.hide() : grid.show();
		return grid;
	}
}

/**
 * User model
 */
function User( data ) {

	this.id = null;
	this.facebook_id = null;
	this.insert_time = null;
	this.update_time = null;
	this.pixel_count = 0;
	this.share_count = 0;
	this.name = null;
	this.email = null;
	this.gender = null;
	this.locale = null;
	this.link = null;
	this.status = null;
	this.timezone = null;

	for ( var property in data ) {
		this[ property ] = data[ property ];
	}

	this.isAnon = function () {
		if ( this.status === 'anon' ) {
			return true;
		}
		return false;
	}

	this.isAdmin = function () {
		if ( this.status === 'admin' ) {
			return true;
		}
		return false;
	}
}

/**
 * Pixel model
 */
function Pixel( data ) {

	this.x = null;
	this.y = null;
	this.author_id = null;
	this.insert_time = null;
	this.update_time = null;
	this.color = null;

	for ( var property in data ) {
		this[ property ] = data[ property ];
	}

	this.fetch = function () {
		var data = { 'x': this.x, 'y': this.y };
		$.get( 'pixels', data, function ( response ) {
			//console.log( response );
			return new window.Pixel( response );
		});
	}

	this.register = function ( oldPixel ) {
		board.oldPixels.splice( board.arrayPointer, board.oldPixels.length - board.arrayPointer, oldPixel );
		board.newPixels.splice( board.arrayPointer, board.newPixels.length - board.arrayPointer, this );
		board.arrayPointer++;
		menu.updateButtons();
		return this;
	}

	this.unregister = function () {
		for ( var i = 0; i < board.oldPixels.length; i++ ) {
			if ( board.oldPixels[ i ].x === this.x && board.oldPixels[ i ].y === this.y ) {
				board.oldPixels.splice( i, 1 );
				board.newPixels.splice( i, 1 );
				board.arrayPointer--;
			}
		}
		menu.updateButtons();
		return this;
	}

	this.save = function () {
		var data = { 'x': this.x, 'y': this.y, 'color': this.color };
		$.post( 'pixels', data, function ( response ) {
			//console.log( response );
			// If the user wasn't allowed to paint the pixel, revert it
			if ( response.message === 'Not your pixel' ) {
				var Pixel = new window.Pixel( response.Pixel );
				var Author = new window.User( response.Author );
				Pixel.paint().unregister();
				menu.showPixelAuthor( Pixel, Author );
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

/**
 * Area model
 */
function Area( data ) {

	this.pixels = [];

	for ( var property in data ) {
		this[ property ] = data[ property ];
	}

	this.register = function ( oldArea ) {
		board.oldPixels.splice( board.arrayPointer, board.oldPixels.length - board.arrayPointer, oldArea );
		board.newPixels.splice( board.arrayPointer, board.newPixels.length - board.arrayPointer, this );
		board.arrayPointer++;
		menu.updateButtons();
		return this;
	}

	this.paint = function () {
		this.pixels.forEach( function ( Pixel ) {
			Pixel.paint();
		});
		return this;
	}

	this.save = function () {
		this.pixels.forEach( function ( Pixel ) {
			Pixel.save(); // Very inefficient
		});
		return this;
	}
}