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
	$( '.menu button' ).mouseover( menu.showTooltip ).mouseout( menu.hideTooltip );
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
	$( document ).keydown( keyboard.keydown );
	$( document ).keyup( keyboard.keyup );

	// Set 'Move' as the default action
	$( '#move-button' ).click();

	// Disable disabled buttons
	menu.updateButtons();

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
			author = Author.name;
		if ( !Author.isAnon() ) {
			picture = '<img src="http://graph.facebook.com/' + Author.facebook_id + '/picture" />';
			author = '<a href="' + Author.link + '">' + Author.name + '</a>';
		}
		var age = roundSeconds( Math.floor( Date.now() / 1000 ) - Pixel.time );
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

		if ( gUser.isAnon() ) {
			$( '#brush-button' ).addClass( 'disabled' ).attr( 'data-tooltip', 'Log in with Facebook to activate the brush' );
		}

		if ( gUser.share_count === 0 ) { // Non-strict comparison because ajax returns '0' rather than 0 (see bugs in README.md)
			$( '#bucket-button' ).addClass( 'disabled' ).attr( 'data-tooltip', 'Share on Facebook to activate the bucket' );
		}

		if ( board.pixelSize < 4 ) {
			$( '#grid-button' ).addClass( 'disabled' );
		}

		if ( !gUser.isAnon() ) {
			$( '#facebook-login-button' ).addClass( 'disabled' );
		}

		if ( gUser.isAnon() ) {
			$( '#facebook-logout-button' ).addClass( 'disabled' );
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
		menu.updateButtons();
		return mouse;
	},

	getInfo: function ( event ) {
		var data = { 'x': mouse.currentX, 'y': mouse.currentY };
		$.get( 'ajax.php?method=getInfo', data, function ( response ) {
			//console.log( response );
			if ( response.Pixel ) {
				var Pixel = new window.Pixel( response.Pixel );
				var Author = new window.User( response.Author );
				menu.showPixelAuthor( Pixel, Author );
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
		board.register( oldPixel, newPixel );

		newPixel.paint().save();
		return mouse;
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
		board.register( oldPixel, newPixel );

		newPixel.erase().save();
		return mouse;
	},

	paintArea: function ( event ) {
		var data = { 'x': mouse.currentX, 'y': mouse.currentY, 'color': menu.activeColor };
		$.post( 'ajax.php?method=paintArea', data, function ( response ) {
			//console.log( response );
			if ( response.message === 'Not your pixel' ) {
				var Pixel = new window.Pixel( response.Pixel );
				var Author = new window.User( response.Author );
				menu.showPixelAuthor( Pixel, Author );
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
				board.register( oldPixels, newPixels );
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

	/* Methods */

	/**
	 * Undo/redo functionality
	 */
	oldPixels: [],
	newPixels: [],
	arrayPointer: 0,

	register: function ( oldPixel, newPixel ) {
		board.oldPixels.splice( board.arrayPointer, board.oldPixels.length - board.arrayPointer, oldPixel );
		board.newPixels.splice( board.arrayPointer, board.newPixels.length - board.arrayPointer, newPixel );
		board.arrayPointer++;
		menu.updateButtons();
	},

	undo: function () {
		if ( board.arrayPointer === 0 ) {
			return board;
		}
		board.arrayPointer--;
		var oldPixel = board.oldPixels[ board.arrayPointer ];

		if ( $.isArray( oldPixel ) ) {
			oldPixel.forEach( function ( Pixel ) {
				Pixel.paint().save();
			});
		} else {
			oldPixel.paint().save();
		}
		menu.updateButtons();
	},

	redo: function () {
		if ( board.arrayPointer === board.newPixels.length ) {
			return board;
		}
		var newPixel = board.newPixels[ board.arrayPointer ];
		board.arrayPointer++;

		if ( $.isArray( newPixel ) ) {
			newPixel.forEach( function ( Pixel ) {
				Pixel.paint().save();
			});
		} else {
			newPixel.paint().save();
		}
		menu.updateButtons();
	},

	zoomIn: function () {
		if ( board.pixelSize === 64 ) {
			return board;
		}
		board.setPixelSize( board.pixelSize * 2 );
		board.refill();
		menu.updateButtons();
		return board;
	},

	zoomOut: function () {
		if ( board.pixelSize === 1 ) {
			return board;
		}
		board.setPixelSize( board.pixelSize / 2 );
		board.refill();
		menu.updateButtons();
		return board;
	},

	fill: function () {
		menu.showAlert( 'Loading pixels, please wait...' );
		var data = {
			'width': board.width,
			'height': board.height,
			'pixelSize': board.pixelSize,
			'centerX': board.centerX,
			'centerY': board.centerY
		};
		$.get( 'ajax.php?method=getBoard', data, function ( response ) {
			//console.log( response );
			var image = new Image();
			image.src = "data:image/png;base64," + response;
			board.context.drawImage( image, 0, 0 );

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
			return grid; // Pixels are too small for the grid
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
 * User model
 */
function User( data ) {
	/**
	 * The property names and defaults match those of the PHP model and the table columns
	 */
	this.id = 'id' in data ? data.id : null,
	this.facebook_id = 'facebook_id' in data ? data.facebook_id : null;
	this.join_time = 'join_time' in data ? data.join_time : null;
	this.last_seen = 'last_seen' in data ? data.last_seen : null;
	this.pixel_count = 'pixel_count' in data ? data.pixel_count : 0;
	this.share_count = 'share_count' in data ? data.share_count : 0;
	this.name = 'name' in data ? data.name : null;
	this.email = 'email' in data ? data.email : null;
	this.gender = 'gender' in data ? data.gender : null;
	this.locale = 'locale' in data ? data.locale : null;
	this.link = 'link' in data ? data.link : null;
	this.status = 'status' in data ? data.status : 'anon';
	this.timezone = 'timezone' in data ? data.timezone : null;

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
	/**
	 * The property names and defaults match those of the PHP model and the table columns
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

	this.register = function ( previous ) {
		
	}

	this.save = function () {
		var data = { 'x': this.x, 'y': this.y, 'color': this.color };
		$.post( 'ajax.php?method=savePixel', data, function ( response ) {
			//console.log( response );
			// If the user wasn't allowed to paint the pixel, revert it
			if ( response.message === 'Not your pixel' ) {
				var Pixel = new window.Pixel( response.Pixel );
				var Author = new window.User( response.Author );

				Pixel.paint();

				menu.showPixelAuthor( Pixel, Author );

				// Remove the reverted pixel from the undo/redo arrays
				for ( var i = 0; i < board.oldPixels.length; i++ ) {
					if ( board.oldPixels[ i ].x === Pixel.x && board.oldPixels[ i ].y === Pixel.y ) {
						board.oldPixels.splice( i, 1 );
						board.newPixels.splice( i, 1 );
						board.arrayPointer--;
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

function Area( data ) {

	this.pixels = 'pixels' in data ? data.pixels : [];

	this.paint = function () {
		this.pixels.forEach( function ( pixel ) {
			pixel.paint();
		});
	}

	this.save = function () {
		this.pixels.forEach( function ( pixel ) {
			pixel.save();
		});
	}
}

// Build the global user
gUser = new window.User({});