$( function () {

	// Initialise the global user
	gUser = new User;

	// Initialize Spectrum
	$( '#color-input' ).spectrum({
		preferredFormat: 'hex',
		showButtons: false,
		show: function ( color ) {
			menu.color = color.toHexString();
		},
		change: function ( color ) {
			menu.color = color.toHexString();
		},
		hide: function ( color ) {
			menu.color = color.toHexString();
		}
	});

	// Set the variables that must wait for the DOM to be loaded
	mural.setCanvas( document.getElementById( 'mural' ) );
	mural.setContext( mural.canvas.getContext( '2d' ) );
	mural.setWidth( $( 'body' ).width() );
	mural.setHeight( $( 'body' ).height() );
	mural.setBackground( '#ddd' );
	mural.setCenterX( mural.getCenterX() );
	mural.setCenterY( mural.getCenterY() );
	mural.setPixelSize( mural.getPixelSize() );
	grid.setCanvas( document.getElementById( 'grid' ) );
	grid.setContext( grid.canvas.getContext( '2d' ) );
	grid.setWidth( mural.width );
	grid.setHeight( mural.height );
	preview.setCanvas( document.getElementById( 'preview' ) );
	preview.setContext( preview.canvas.getContext( '2d' ) );
	preview.setWidth( 300 );
	preview.setHeight( 200 );

	// Bind events
	$( '#mural' ).mousedown( mouse.down ).mousemove( mouse.move ).mouseup( mouse.up );
	$( '#popup-wrapper' ).click( menu.hidePopup );
	$( '#move-button' ).click( menu.clickMoveButton );
	$( '#grid-button' ).click( menu.clickGridButton );
	$( '#preview-button' ).click( menu.clickPreviewButton );
	$( '#zoom-in-button' ).click( menu.clickZoomInButton );
	$( '#zoom-out-button' ).click( menu.clickZoomOutButton );
	$( '#undo-button' ).click( menu.clickUndoButton );
	$( '#redo-button' ).click( menu.clickRedoButton );
	$( '#author-button' ).click( menu.clickAuthorButton );
	$( '#dropper-button' ).click( menu.clickDropperButton );
	$( '#pencil-button' ).click( menu.clickPencilButton );
	$( '#brush-button' ).click( menu.clickBrushButton );
	$( '#eraser-button' ).click( menu.clickEraserButton );
	$( '#bucket-button' ).click( menu.clickBucketButton );
	$( '.menu button' ).mouseover( menu.showTooltip ).mouseout( menu.hideTooltip ).click( menu.updateButtons );
	$( document ).keydown( keyboard.keydown ).keyup( keyboard.keyup ).mouseup( mouse.up );

	// Set 'Move' as the default action
	$( '#move-button' ).click();

	// Fill the mural
	mural.fill();
});

menu = {

	activeTool: 'move',
	previousTool: null,
	color: '#000000',

	// EVENT HANDLERS

	clickGridButton: function ( event ) {
		grid.toggle();
	},

	clickPreviewButton: function ( event ) {
		preview.toggle();
	},

	clickZoomInButton: function ( event ) {
		mural.zoomIn();
	},

	clickZoomOutButton: function ( event ) {
		mural.zoomOut();
	},

	clickUndoButton: function ( event ) {
		mural.undo();
	},

	clickRedoButton: function ( event ) {
		mural.redo();
	},

	clickAuthorButton: function ( event ) {
		$( '#mural' ).css( 'cursor', 'default' );
		$( '#author-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'getAuthor';
		mouse.dragAction = null;
		mouse.upAction = null;
		menu.activeTool = 'author';
	},

	clickMoveButton: function ( event ) {
		$( '#mural' ).css( 'cursor', 'move' );
		$( '#move-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'movemural1';
		mouse.dragAction = 'movemural2';
		mouse.upAction = 'movemural3';
		menu.activeTool = 'move';
	},

	clickDropperButton: function ( event ) {
		$( '#mural' ).css( 'cursor', 'default' );
		$( '#dropper-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'suckColor';
		mouse.dragAction = 'suckColor';
		mouse.upAction = null;
		menu.activeTool = 'dropper';
	},

	clickPencilButton: function ( event ) {
		$( '#mural' ).css( 'cursor', 'default' );
		$( '#pencil-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'paintPixel';
		mouse.dragAction = null;
		mouse.upAction = null;
		menu.activeTool = 'pencil';
	},

	clickBrushButton: function ( event ) {
		$( '#mural' ).css( 'cursor', 'default' );
		$( '#brush-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'paintPixel';
		mouse.dragAction = 'paintPixel';
		mouse.upAction = null;
		menu.activeTool = 'brush';
	},

	clickBucketButton: function ( event ) {
		$( '#mural' ).css( 'cursor', 'default' );
		$( '#bucket-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'paintArea';
		mouse.dragAction = null;
		mouse.upAction = null;
		menu.activeTool = 'bucket';
	},

	clickEraserButton: function ( event ) {
		$( '#mural' ).css( 'cursor', 'default' );
		$( '#eraser-button' ).addClass( 'active' ).siblings().removeClass( 'active' );
		mouse.downAction = 'erasePixel';
		mouse.dragAction = 'erasePixel';
		mouse.upAction = null;
		menu.activeTool = 'eraser';
	},

	// INTERFACE ACTIONS

	showTooltip: function ( event ) {
		var button = $( event.target );
		var tooltip = button.attr( 'data-tooltip' );
		if ( tooltip ) {
			var span = $( '<span>' ).addClass( 'tooltip' ).text( tooltip );
			button.append( span );
		}
	},

	hideTooltip: function () {
		$( '.tooltip' ).remove();
	},

	showAlert: function ( html, duration ) {
		$( '#alert' ).html( html ).show();
		if ( duration ) {
			window.setTimeout( menu.hideAlert, duration );
		}
	},

	hideAlert: function () {
		$( '#alert' ).hide();
	},

	hidePopup: function () {
		$( '#popup-wrapper' ).hide();
	},

	showPixelAuthor: function ( Pixel, Author ) {
		var picture = '<img src="images/anon.png">',
			author = Author.name,
			age = roundSeconds( Math.floor( Date.now() / 1000 ) - Pixel.insert_time );
		if ( !Author.isAnon() ) {
			picture = '<img src="http://graph.facebook.com/' + Author.facebook_id + '/picture">';
			author = '<a target="_blank" href="' + Author.link + '">' + Author.name + '</a>';
		}
		menu.showAlert( picture + '<p>By ' + author + '</p><p>' + age + ' ago</p>', 4000 );
	},

	updateButtons: function () {
		$( '.menu button' ).removeClass( 'disabled' ); // First enable everything

		if ( mural.pixelSize === 64 ) {
			$( '#zoom-in-button' ).addClass( 'disabled' );
		}

		if ( mural.pixelSize === 1 ) {
			$( '#zoom-out-button' ).addClass( 'disabled' );
			$( '#preview-button' ).addClass( 'disabled' );
		}

		if ( mural.arrayPointer === 0 ) {
			$( '#undo-button' ).addClass( 'disabled' );
		}

		if ( mural.arrayPointer === mural.newPixels.length ) {
			$( '#redo-button' ).addClass( 'disabled' );
		}

		if ( mural.pixelSize < 4 ) {
			$( '#grid-button' ).addClass( 'disabled' );
		}
	}
};

keyboard = {

	// EVENT HANDLERS

	keydown: function ( event ) {
		// Alt
		if ( event.keyCode === 18 ) {
			menu.previousTool = menu.activeTool;
			menu.clickDropperButton();
		}
		// Spacebar
		if ( event.keyCode === 32 ) {
			menu.clickMoveButton();
		}
		// A
		if ( event.keyCode === 65 ) {
			menu.clickAuthorButton();
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
			if ( menu.previousTool === 'author' ) {
				menu.clickAuthorButton();
			}
			if ( menu.previousTool === 'move' ) {
				menu.clickMoveButton();
			}
			if ( menu.previousTool === 'pencil' ) {
				menu.clickPencilButton();
			}
			if ( menu.previousTool === 'brush' ) {
				menu.clickBrushButton();
			}
			if ( menu.previousTool === 'eraser' ) {
				menu.clickEraserButton();
			}
			if ( menu.previousTool === 'bucket' ) {
				menu.clickBucketButton();
			}
		}
	}
};

mouse = {

	// The distance from the origin of the coordinate system in virtual pixels (not real ones)
	currentX: null,
	currentY: null,

	previousX: null,
	previousY: null,

	state: 'up',

	downAction: null,
	dragAction: null,
	upAction: null,

	// GETTERS

	getCurrentX: function ( event ) {
		var offsetX = event.pageX - $( event.target ).offset().left - 1, // The -1 is to correct a minor displacement
			currentX = mural.centerX - Math.floor( mural.xPixels / 2 ) + Math.floor( offsetX / mural.pixelSize );
		return currentX;
	},

	getCurrentY: function ( event ) {
		var offsetY = event.pageY - $( event.target ).offset().top - 2, // The -2 is to correct a minor displacement
			currentY = mural.centerY - Math.floor( mural.yPixels / 2 ) + Math.floor( offsetY / mural.pixelSize );
		return currentY;
	},

	// EVENT HANDLERS

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

	// ACTIONS

	movemural1: function ( event ) {
		mouse.diffX = 0;
		mouse.diffY = 0;
		mural.imageData = mural.context.getImageData( 0, 0, mural.width, mural.height );
	},

	movemural2: function ( event ) {
		mural.centerX += mouse.previousX - mouse.currentX;
		mural.centerY += mouse.previousY - mouse.currentY;

		mouse.diffX += ( mouse.currentX - mouse.previousX ) * mural.pixelSize;
		mouse.diffY += ( mouse.currentY - mouse.previousY ) * mural.pixelSize;

		mural.clear();
		mural.context.putImageData( mural.imageData, parseFloat( mouse.diffX ), parseFloat( mouse.diffY ) );

		// Bugfix: without this, the mural flickers when moving
		mouse.currentX = mouse.getCurrentX( event );
		mouse.currentY = mouse.getCurrentY( event );
	},

	movemural3: function ( event ) {
		if ( mouse.diffX || mouse.diffY ) {
			mural.fill();
		}
	},

	suckColor: function ( event ) {
		var offsetX = event.pageX - $( event.target ).offset().left - 1; // The -1 is to correct a minor displacement
			offsetY = event.pageY - $( event.target ).offset().top - 2, // The -2 is to correct a minor displacement
			imageData = mural.context.getImageData( offsetX, offsetY, 1, 1 ),
			red   = imageData.data[0],
			green = imageData.data[1],
			blue  = imageData.data[2],
			alpha = imageData.data[3];
		menu.color = alpha ? rgb2hex( red, green, blue ) : mural.background;
		menu.updateButtons();
	},

	getAuthor: function ( event ) {
		var data = { 'x': mouse.currentX, 'y': mouse.currentY };
		$.get( 'pixels', data, function ( response ) {
			//console.log( response );
			if ( response.Pixel ) {
				var Pixel = new window.Pixel( response.Pixel ),
					Author = new window.User( response.Author );
				menu.showPixelAuthor( Pixel, Author );
			}
		});
	},

	paintPixel: function ( event ) {
		var oldPixel = mural.getPixel( mouse.currentX, mouse.currentY ),
			newPixel = new Pixel({ 'x': mouse.currentX, 'y': mouse.currentY, 'color': menu.color });

		if ( newPixel.color === oldPixel.color && mouse.currentX === mouse.previousX && mouse.currentY === mouse.previousY ) {
			newPixel.color = null; // For convenience, re-painting a pixel erases it
		}

		newPixel.paint().save().register( oldPixel );
	},

	erasePixel: function ( event ) {
		var oldPixel = mural.getPixel( mouse.currentX, mouse.currentY );

		if ( oldPixel.color === null ) {
			return; // The pixel doesn't exist, no need to continue
		}

		var newPixel = new Pixel({ 'x': mouse.currentX, 'y': mouse.currentY });

		newPixel.erase().save().register( oldPixel );
	},

	paintArea: function ( event ) {
		var data = { 'x': mouse.currentX, 'y': mouse.currentY, 'color': menu.color };
		$.post( 'areas', data, function ( response ) {
			//console.log( response );
			if ( response.message === 'Not your pixel' ) {
				var Pixel = new window.Pixel( response.Pixel ),
					Author = new window.User( response.Author );
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
};

mural = {

	canvas: null,
	context: null,

	width: null,
	height: null,

	centerX: 0,
	centerY: 0,

	pixelSize: 2,

	xPixels: null,
	yPixels: null,

	background: null,

	// GETTERS

	getXpixels: function () {
		return Math.floor( mural.width / mural.pixelSize );
	},

	getYpixels: function () {
		return Math.floor( mural.height / mural.pixelSize );
	},

	getCenterX: function() {
		var centerX = parseInt( window.location.pathname.split( '/' ).slice( -3, -2 ) );
		if ( !isNaN( centerX ) ) {
			return centerX;
		}
		return mural.centerX;
	},

	getCenterY: function() {
		var centerY = parseInt( window.location.pathname.split( '/' ).slice( -2, -1 ) );
		if ( !isNaN( centerY ) ) {
			return centerY;
		}
		return mural.centerY;
	},

	getPixelSize: function() {
		var pixelSize = parseInt( window.location.pathname.split( '/' ).slice( -1 ) );
		if ( !isNaN( pixelSize ) ) {
			return pixelSize;
		}
		return mural.pixelSize;
	},

	/**
	 * Build a basic pixel object out of the coordinates and the color,
	 * but suck the color directly from the canvas (not the database)
	 * so it only works for visible pixels
	 */
	getPixel: function ( x, y ) {
		var rectX = Math.abs( mural.centerX - Math.floor( mural.xPixels / 2 ) - x ) * mural.pixelSize,
			rectY = Math.abs( mural.centerY - Math.floor( mural.yPixels / 2 ) - y ) * mural.pixelSize,
			imageData = mural.context.getImageData( rectX, rectY, 1, 1 ),
			red   = imageData.data[0],
			green = imageData.data[1],
			blue  = imageData.data[2],
			alpha = imageData.data[3],
			color = alpha ? rgb2hex( red, green, blue ) : null,
			Pixel = new window.Pixel({ 'x': x, 'y': y, 'color': color });
		return Pixel;
	},

	// SETTERS

	setCanvas: function ( value ) {
		mural.canvas = value;
	},

	setContext: function ( value ) {
		mural.context = value;
	},

	setBackground: function ( value ) {
		mural.background = value;
		$( mural.canvas ).css( 'background', value );
	},

	setWidth: function ( value ) {
		mural.width = value;
		mural.canvas.setAttribute( 'width', value );
		mural.xPixels = mural.getXpixels();
	},

	setHeight: function ( value ) {
		mural.height = value;
		mural.canvas.setAttribute( 'height', value );
		mural.yPixels = mural.getYpixels();
	},

	setCenterX: function ( value ) {
		mural.centerX = value;
	},

	setCenterY: function ( value ) {
		mural.centerY = value;
	},

	setPixelSize: function ( value ) {
		mural.pixelSize = parseInt( value );
		if ( mural.pixelSize > 64 ) {
			mural.pixelSize = 64; // Max pixel size
		}
		if ( mural.pixelSize < 1 ) {
			mural.pixelSize = 1; // Min pixel size
		}
		mural.xPixels = mural.getXpixels();
		mural.yPixels = mural.getYpixels();
	},

	// ACTIONS

	zoomIn: function () {
		if ( mural.pixelSize === 64 ) {
			return;
		}
		mural.setPixelSize( mural.pixelSize * 2 );
		mural.fill();
	},

	zoomOut: function () {
		if ( mural.pixelSize === 1 ) {
			return;
		}
		mural.setPixelSize( mural.pixelSize / 2 );
		mural.fill();
	},

	// Part of the undo/redo functionality
	oldPixels: [],
	newPixels: [],
	arrayPointer: 0,

	undo: function () {
		if ( mural.arrayPointer === 0 ) {
			return;
		}
		mural.arrayPointer--;
		var oldPixels = mural.oldPixels[ mural.arrayPointer ];
		oldPixels.paint().save();
	},

	redo: function () {
		if ( mural.arrayPointer === mural.newPixels.length ) {
			return;
		}
		var newPixels = mural.newPixels[ mural.arrayPointer ];
		mural.arrayPointer++;
		newPixels.paint().save();
	},

	fill: function () {
		menu.showAlert( 'Loading pixels, please wait...' );
		var data = {
			'width': mural.width,
			'height': mural.height,
			'centerX': mural.centerX,
			'centerY': mural.centerY,
			'pixelSize': mural.pixelSize,
			'format': 'base64'
		};
		$.get( 'areas', data, function ( response ) {
			//console.log( response );
			var image = new Image();
			image.src = 'data:image/png;base64,' + response;
			image.onload = function () {
				mural.clear();
				mural.context.drawImage( image, 0, 0 );
				grid.toggle().toggle();
			};
			$( '#alert' ).hide();

			// Update the URL of the browser
			var BASE = $( 'base' ).attr( 'href' );
			history.replaceState( null, null, BASE + mural.centerX + '/' + mural.centerY + '/' + mural.pixelSize );
		});
		preview.toggle().toggle().fill();
		menu.updateButtons();
	},

	clear: function () {
		mural.context.clearRect( 0, 0, mural.width, mural.height );
	}
};

grid = {

	canvas: null,
	context: null,

	width: null,
	height: null,

	color: '#ccc',
	visible: false,

	setCanvas: function ( value ) {
		grid.canvas = value;
	},

	setContext: function ( value ) {
		grid.context = value;
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
		if ( mural.pixelSize < 4 ) {
			return; // Pixels are too small for the grid
		}
		grid.context.beginPath();
		for ( var x = 0; x <= mural.xPixels; x++ ) {
			grid.context.moveTo( x * mural.pixelSize - 0.5, 0 ); // The 0.5 avoids getting blury lines
			grid.context.lineTo( x * mural.pixelSize - 0.5, grid.height );
		}
		for ( var y = 0; y <= mural.yPixels; y++ ) {
			grid.context.moveTo( 0, y * mural.pixelSize - 0.5 );
			grid.context.lineTo( grid.width, y * mural.pixelSize - 0.5 );
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
};

preview = {

	canvas: null,
	context: null,

	width: null,
	height: null,

	visible: true,

	// SETTERS

	setCanvas: function ( value ) {
		preview.canvas = value;
	},

	setContext: function ( value ) {
		preview.context = value;
	},

	setWidth: function ( value ) {
		preview.width = value;
		preview.canvas.setAttribute( 'width', value );
	},

	setHeight: function ( value ) {
		preview.height = value;
		preview.canvas.setAttribute( 'height', value );
	},

	// ACTIONS

	fill: function () {
		var data = {
			'width': preview.width,
			'height': preview.height,
			'centerX': mural.centerX,
			'centerY': mural.centerY,
			'pixelSize': 1,
			'format': 'base64'
		};
		$.get( 'areas', data, function ( response ) {
			//console.log( response );
			var image = new Image();
			image.src = 'data:image/png;base64,' + response;
			image.onload = function () {
				preview.clear();
				preview.context.drawImage( image, 0, 0 );
			};
		});
	},

	clear: function () {
		preview.context.clearRect( 0, 0, preview.width, preview.height );
	},

	show: function () {
		preview.visible = true;
		if ( mural.pixelSize === 1 ) {
			return;
		}
		$( preview.canvas ).show();
	},

	hide: function () {
		preview.visible = false;
		$( preview.canvas ).hide();
	},

	toggle: function () {
		preview.visible ? preview.hide() : preview.show();
		return preview;
	}
};

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
	this.status = 'anon';
	this.timezone = null;

	for ( var property in data ) {
		this[ property ] = data[ property ];
	}

	this.isAnon = function () {
		if ( this.status === 'anon' ) {
			return true;
		}
		return false;
	};

	this.isAdmin = function () {
		if ( this.status === 'admin' ) {
			return true;
		}
		return false;
	};
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
	};

	this.register = function ( oldPixel ) {
		mural.oldPixels.splice( mural.arrayPointer, mural.oldPixels.length - mural.arrayPointer, oldPixel );
		mural.newPixels.splice( mural.arrayPointer, mural.newPixels.length - mural.arrayPointer, this );
		mural.arrayPointer++;
		menu.updateButtons();
		return this;
	};

	this.unregister = function () {
		for ( var i = 0; i < mural.oldPixels.length; i++ ) {
			if ( mural.oldPixels[ i ].x === this.x && mural.oldPixels[ i ].y === this.y ) {
				mural.oldPixels.splice( i, 1 );
				mural.newPixels.splice( i, 1 );
				mural.arrayPointer--;
			}
		}
		menu.updateButtons();
		return this;
	};

	this.save = function () {
		var data = { 'x': this.x, 'y': this.y, 'color': this.color, 'tool': menu.activeTool };
		$.post( 'pixels', data, function ( response ) {
			//console.log( response );
			switch ( response.message ) {
				case 'Buy the brush':
					if ( response.Pixel ) {
						var Pixel = new window.Pixel( response.Pixel );
						Pixel.paint().unregister();
					} else {
						var Pixel = new window.Pixel({ 'x': data.x, 'y': data.y });
						Pixel.erase().unregister();
					}
					break;

				case 'Not your pixel':
					var Pixel = new window.Pixel( response.Pixel );
					var Author = new window.User( response.Author );
					Pixel.paint().unregister();
					menu.showPixelAuthor( Pixel, Author );
					break;

				default:
					menu.showAlert( response.message, 1000 );
			}
		});
		return this;
	};

	this.paint = function () {
		if ( this.color === null ) {
			return this.erase();
		}

		var x = ( this.x + Math.floor( mural.xPixels / 2 ) - mural.centerX ) * mural.pixelSize,
			y = ( this.y + Math.floor( mural.yPixels / 2 ) - mural.centerY ) * mural.pixelSize;
		mural.context.fillStyle = this.color;
		mural.context.fillRect( x, y, mural.pixelSize, mural.pixelSize );

		// Draw in the preview too
		x = this.x + Math.floor( preview.width / 2 ) - mural.centerX,
		y = this.y + Math.floor( preview.height / 2 ) - mural.centerY;
		preview.context.fillStyle = this.color;
		preview.context.fillRect( x, y, 1, 1 );

		return this;
	};

	this.erase = function () {
		var x = ( this.x + Math.floor( mural.xPixels / 2 ) - mural.centerX ) * mural.pixelSize,
			y = ( this.y + Math.floor( mural.yPixels / 2 ) - mural.centerY ) * mural.pixelSize;
		mural.context.clearRect( x, y, mural.pixelSize, mural.pixelSize );

		// Erase from the preview too
		x = this.x + Math.floor( preview.width / 2 ) - mural.centerX,
		y = this.y + Math.floor( preview.height / 2 ) - mural.centerY;
		preview.context.clearRect( x, y, 1, 1 );

		this.color = null;
		return this;
	};
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
		mural.oldPixels.splice( mural.arrayPointer, mural.oldPixels.length - mural.arrayPointer, oldArea );
		mural.newPixels.splice( mural.arrayPointer, mural.newPixels.length - mural.arrayPointer, this );
		mural.arrayPointer++;
		menu.updateButtons();
		return this;
	};

	this.paint = function () {
		this.pixels.forEach( function ( Pixel ) {
			Pixel.paint();
		});
		return this;
	};

	this.save = function () {
		this.pixels.forEach( function ( Pixel ) {
			Pixel.save(); // Very inefficient
		});
		return this;
	};
}