$( function () {

	// Initialise Facebook
	facebook.init();

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
	}).next().attr( 'title', 'Color [C]' );

	// Set the variables that must wait for the DOM to be loaded
	mural.setCanvas( document.getElementById( 'mural' ) );
	mural.setCenterX( mural.getCenterX() );
	mural.setCenterY( mural.getCenterY() );
	mural.setPixelSize( mural.getPixelSize() );
	grid.setCanvas( document.getElementById( 'grid' ) );
	preview.setCanvas( document.getElementById( 'preview' ) );
	preview.setWidth( 300 );
	preview.setHeight( 200 );

	// Set 'move' as the default action
	menu.bindEvents();
	menu.clickMoveButton();

	// Fill the board
	mural.update();
});

user = new User; // Dummy user

facebook = {

	init: function () {
		FB.init({
			appId: FACEBOOK_APP_ID,
			xfbml: true,
			status: true,
			cookie: true,
			version: 'v2.4'
		});
		FB.getLoginStatus( facebook.statusChangeCallback );
	},

	login: function () {
		FB.login( facebook.statusChangeCallback );
	},

	logout: function () {
		FB.logout( facebook.statusChangeCallback );
	},

	share: function () {
		FB.XFBML.parse(); // Update the URL to be shared
		FB.ui({ 'method': 'share', 'href': location.href });
	},

	statusChangeCallback: function ( response ) {
		//console.log( response );
		// First get a token
		$.get( 'Tokens', function ( response ) {
			//console.log( response );
			// Then use the token to update the user object
			$.get( 'Users', { 'token': response }, function ( response ) {
				//console.log( response );
				user = new User( response );
				menu.update();
			});
		});
	}
};

menu = {

	activeTool: null,
	previousTool: null,

	color: '#000000',

	// Part of the undo/redo functionality
	oldPixels: [],
	newPixels: [],
	arrayPointer: 0,

	// EVENT HANDLERS

	bindEvents: function () {
		$( '#move-button' ).click( menu.clickMoveButton );
		$( '#grid-button' ).click( menu.clickGridButton );
		$( '#preview-button' ).click( menu.clickPreviewButton );
		$( '#zoom-in-button' ).click( menu.clickZoomInButton );
		$( '#zoom-out-button' ).click( menu.clickZoomOutButton );
		$( '#undo-button' ).click( menu.clickUndoButton );
		$( '#redo-button' ).click( menu.clickRedoButton );
		//$( '#link-button' ).click( menu.clickLinkButton );
		$( '#dropper-button' ).click( menu.clickDropperButton );
		$( '#pencil-button' ).click( menu.clickPencilButton );
		$( '#brush-button' ).click( menu.clickBrushButton );
		$( '#eraser-button' ).click( menu.clickEraserButton );
		$( '#bucket-button' ).click( menu.clickBucketButton );
		$( '#facebook-icon' ).click( facebook.login );
		$( '#facebook-login-button' ).click( facebook.login );
		$( '#facebook-logout-button' ).click( facebook.logout );
		$( '#facebook-share-button' ).click( facebook.share );
		$( '#mural' ).mousedown( mouse.down ).mousemove( mouse.move ).mouseup( mouse.up );

		$( window ).resize( mural.resize );

		$( document ).bind( 'keydown', 'Space', menu.clickMoveButton );
		$( document ).bind( 'keydown', 'b', menu.clickBucketButton );
		$( document ).bind( 'keydown', 'c', menu.clickColorButton );
		$( document ).bind( 'keydown', 'd', menu.clickDropperButton );
		$( document ).bind( 'keydown', 'e', menu.clickEraserButton );
		$( document ).bind( 'keydown', 'g', menu.clickGridButton );
		$( document ).bind( 'keydown', 'i', menu.clickZoomInButton );
		//$( document ).bind( 'keydown', 'l', menu.clickLinkButton );
		$( document ).bind( 'keydown', 'o', menu.clickZoomOutButton );
		$( document ).bind( 'keydown', 'p', menu.clickPencilButton );
		$( document ).bind( 'keydown', 'v', menu.clickBrushButton );
		$( document ).bind( 'keydown', 'x', menu.clickRedoButton );
		$( document ).bind( 'keydown', 'z', menu.clickUndoButton );

		// For convenience, select the dropper when pressing Alt, and return to the painting tool when releasing
		$( document ).bind( 'keydown', 'Alt', function () {
			menu.previousTool = menu.activeTool;
			menu.clickDropperButton();
		});
		$( document ).bind( 'keyup', 'Alt', function () {
			if ( menu.previousTool === 'pencil' ) {
				menu.clickPencilButton();
			}
			if ( menu.previousTool === 'brush' ) {
				menu.clickBrushButton();
			}
			if ( menu.previousTool === 'bucket' ) {
				menu.clickBucketButton();
			}
		});
	},

	clickMoveButton: function () {
		mouse.downAction = mouse.moveMural1;
		mouse.dragAction = mouse.moveMural2;
		mouse.upAction = mouse.moveMural3;
		menu.activeTool = 'move';
		menu.update();
	},

	clickGridButton: function () {
		grid.toggle();
		grid.update();
	},

	clickPreviewButton: function () {
		preview.toggle();
		preview.update();
	},

	clickZoomInButton: function () {
		mural.zoomIn();
		menu.update();
	},

	clickZoomOutButton: function () {
		mural.zoomOut();
		menu.update();
	},

	clickUndoButton: function () {
		if ( menu.arrayPointer === 0 ) {
			return;
		}
		menu.arrayPointer--;
		var oldPixels = menu.oldPixels[ menu.arrayPointer ];
		oldPixels.paint().save();
		menu.update();
	},

	clickRedoButton: function () {
		if ( menu.arrayPointer === menu.newPixels.length ) {
			return;
		}
		var newPixels = menu.newPixels[ menu.arrayPointer ];
		menu.arrayPointer++;
		newPixels.paint().save();
		menu.update();
	},

	clickLinkButton: function () {
		var link = prompt( 'Link all your pixels to the following URL:', user.link );
		if ( link === null ) {
			return; // The user pressed cancel
		}
		user.link = link;
		user.update();
	},

	clickDropperButton: function () {
		mouse.downAction = mouse.suckColor;
		mouse.dragAction = mouse.suckColor;
		mouse.upAction = null;
		menu.activeTool = 'dropper';
		menu.update();
	},

	clickPencilButton: function () {
		mouse.downAction = mouse.paintPixel;
		mouse.dragAction = null;
		mouse.upAction = null;
		menu.activeTool = 'pencil';
		menu.update();
	},

	clickBrushButton: function () {
		mouse.downAction = mouse.paintPixel;
		mouse.dragAction = mouse.paintPixel;
		mouse.upAction = null;
		menu.activeTool = 'brush';
		menu.update();
	},

	clickEraserButton: function () {
		mouse.downAction = mouse.erasePixel;
		mouse.dragAction = mouse.erasePixel;
		mouse.upAction = null;
		menu.activeTool = 'eraser';
		menu.update();
	},

	clickBucketButton: function () {
		mouse.downAction = mouse.paintArea;
		mouse.dragAction = null;
		mouse.upAction = null;
		menu.activeTool = 'bucket';
		menu.update();
	},

	clickColorButton: function () {
		$( '#color-input' ).spectrum( 'toggle' );
	},

	// INTERFACE ACTIONS

	showLoading: function () {
		$( '#loading' ).show();
	},

	hideLoading: function () {
		$( '#loading' ).hide();
	},

	showPixelAuthor: function ( Pixel, Author ) {
		var picture = '<img src="images/anon.png">',
			author = Author.name,
			date = new Date( Pixel.insert_time * 1000 ),
			date = '<br>' + date.toUTCString();
		if ( Author.facebook_id ) {
			picture = '<img src="http://graph.facebook.com/' + Author.facebook_id + '/picture">';
			author = '<a target="_blank" href="https://www.facebook.com/app_scoped_user_id/' + Author.facebook_id + '/">' + Author.name + '</a>';
		}
		var span = $( '<span>' ).attr( 'id', 'author' ).html( picture + author + date );
		$( 'body' ).append( span );
		window.setTimeout( function () {
			span.remove();
		}, 4000 );
	},

	update: function () {
		// First enable all the buttons, then disable the ones that should be disabled
		$( '.menu button' ).removeClass( 'disabled' );

		if ( mural.pixelSize === 64 ) {
			$( '#zoom-in-button' ).addClass( 'disabled' );
		}

		if ( mural.pixelSize === 1 ) {
			$( '#zoom-out-button' ).addClass( 'disabled' );
		}

		if ( menu.arrayPointer === 0 ) {
			$( '#undo-button' ).addClass( 'disabled' );
		}

		if ( menu.arrayPointer === menu.newPixels.length ) {
			$( '#redo-button' ).addClass( 'disabled' );
		}

		if ( mural.pixelSize < 4 ) {
			$( '#grid-button' ).addClass( 'disabled' );
			$( '#preview-button' ).addClass( 'disabled' );
		}

		$( '.menu button' ).removeClass( 'active' );
		$( '#' + menu.activeTool + '-button' ).addClass( 'active' );

		$( '#color-input' ).spectrum( 'set', menu.color );

		if ( user.facebook_id ) {
			$( '#facebook-icon' ).hide();
			$( '#facebook-login-button' ).hide();
			$( '#facebook-logout-button' ).show();
			$( '#profile-picture' ).attr( 'src', 'http://graph.facebook.com/' + user.facebook_id + '/picture' );
    	} else {
    		$( '#facebook-icon' ).show();
			$( '#facebook-login-button' ).show();
			$( '#facebook-logout-button' ).hide();
			$( '#profile-picture' ).attr( 'src', 'images/anon.png' );
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
		mouse.downAction( event );
	},

	move: function ( event ) {
		mouse.previousX = mouse.currentX;
		mouse.previousY = mouse.currentY;

		mouse.currentX = mouse.getCurrentX( event );
		mouse.currentY = mouse.getCurrentY( event );

		// If the mouse is being dragged
		if ( mouse.state === 'down' && ( mouse.currentX !== mouse.previousX || mouse.currentY !== mouse.previousY ) && mouse.dragAction ) {
			mouse.dragAction( event );
		}
	},

	up: function ( event ) {
		mouse.state = 'up';
		if ( mouse.upAction ) {
			mouse.upAction( event );
		}
	},

	// ACTIONS

	moveMural1: function ( event ) {
		mouse.diffX = 0;
		mouse.diffY = 0;
		mural.imageData = mural.context.getImageData( 0, 0, mural.width, mural.height );
	},

	moveMural2: function ( event ) {
		mural.centerX += mouse.previousX - mouse.currentX;
		mural.centerY += mouse.previousY - mouse.currentY;

		mouse.diffX += ( mouse.currentX - mouse.previousX ) * mural.pixelSize;
		mouse.diffY += ( mouse.currentY - mouse.previousY ) * mural.pixelSize;

		mural.context.clearRect( 0, 0, mural.width, mural.height );
		mural.context.putImageData( mural.imageData, parseFloat( mouse.diffX ), parseFloat( mouse.diffY ) );

		// Bugfix: without this, the mural flickers when moving
		mouse.currentX = mouse.getCurrentX( event );
		mouse.currentY = mouse.getCurrentY( event );
	},

	moveMural3: function ( event ) {
		if ( mouse.diffX || mouse.diffY ) {
			mural.update();
		} else {
			var data = { 'x': mouse.currentX, 'y': mouse.currentY };
			$.get( 'Pixels', data, function ( response ) {
				if ( response ) {
					menu.showPixelAuthor( response.Pixel, response.Author );
				}
			});
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
		if ( !alpha ) {
			return; // The user clicked the background
		}
		menu.color = rgb2hex( red, green, blue );
		menu.update();
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
		menu.showLoading();
		var data = {
			'x': mouse.currentX,
			'y': mouse.currentY,
			'color': menu.color
		};
		$.post( 'Areas', data, function ( response ) {
			//console.log( response );
			switch ( response.code ) {
				case 200:
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
					break;

				case 401:
				case 403:
					if ( response.data ) {
						var Pixel = new window.Pixel( response.data );
						Pixel.paint().unregister();
					} else {
						var Pixel = new window.Pixel({ 'x': data.x, 'y': data.y });
						Pixel.erase().unregister();
					}
					break;
			}
			menu.hideLoading();
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
	 * Build a basic pixel object out of the coordinates and the color
	 *
	 * Sucks the color directly from the canvas (not the database)
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
		mural.context = value.getContext( '2d' );
	},

	setWidth: function ( value ) {
		if ( mural.width === value ) {
			return;
		}
		mural.width = value;
		mural.canvas.setAttribute( 'width', value );
		mural.xPixels = mural.getXpixels();
	},

	setHeight: function ( value ) {
		if ( mural.height === value ) {
			return;
		}
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
		mural.update();
	},

	zoomOut: function () {
		if ( mural.pixelSize === 1 ) {
			return;
		}
		mural.setPixelSize( mural.pixelSize / 2 );
		mural.update();
	},

	timeout: null,
	resize: function () {
		clearTimeout( mural.timeout );
		mural.timeout = setTimeout( mural.update, 200 );	
	},

	update: function () {
		menu.showLoading();

		mural.setWidth( window.innerWidth );
		mural.setHeight( window.innerHeight );

		var data = {
			'width': mural.width,
			'height': mural.height,
			'centerX': mural.centerX,
			'centerY': mural.centerY,
			'pixelSize': mural.pixelSize,
			'format': 'base64'
		};
		$.get( 'Areas', data, function ( response ) {
			//console.log( response );
			var image = new Image();
			image.src = 'data:image/png;base64,' + response;
			image.onload = function () {
				// Make sure that the user hasn't moved again or zoomed while waiting for the server response
				if ( data.centerX === mural.centerX && data.centerY === mural.centerY && data.pixelSize === mural.pixelSize ) {
					mural.context.clearRect( 0, 0, mural.width, mural.height );
					mural.context.drawImage( image, 0, 0 );

					grid.update();
					preview.update();

					menu.hideLoading();

					// Update the URL of the browser
					var BASE = $( 'base' ).attr( 'href' );
					history.replaceState( null, null, BASE + mural.centerX + '/' + mural.centerY + '/' + mural.pixelSize );
				}
			};
		});
	}
};

grid = {

	canvas: null,
	context: null,

	width: null,
	height: null,

	visible: false,

	// SETTERS

	setCanvas: function ( value ) {
		grid.canvas = value;
		grid.context = value.getContext( '2d' );
	},

	setWidth: function ( value ) {
		if ( grid.width === value ) {
			return;
		}
		grid.width = value;
		grid.canvas.setAttribute( 'width', value );
	},

	setHeight: function ( value ) {
		if ( grid.height === value ) {
			return;
		}
		grid.height = value;
		grid.canvas.setAttribute( 'height', value );
	},

	// ACTIONS

	show: function () {
		if ( mural.pixelSize < 4 ) {
			return;
		}
		grid.visible = true;
		$( grid.canvas ).show();
	},

	hide: function () {
		grid.visible = false;
		$( grid.canvas ).hide();
	},

	toggle: function () {
		grid.visible ? grid.hide() : grid.show();
	},

	update: function () {
		if ( mural.pixelSize < 4 ) {
			grid.hide();
			return;
		}
		grid.setWidth( mural.width );
		grid.setHeight( mural.height );
		grid.context.clearRect( 0, 0, grid.canvas.width, grid.canvas.height );
		grid.context.beginPath();
		for ( var x = 0; x <= mural.xPixels; x++ ) {
			grid.context.moveTo( x * mural.pixelSize - 0.5, 0 ); // The 0.5 avoids getting blury lines
			grid.context.lineTo( x * mural.pixelSize - 0.5, grid.height );
		}
		for ( var y = 0; y <= mural.yPixels; y++ ) {
			grid.context.moveTo( 0, y * mural.pixelSize - 0.5 );
			grid.context.lineTo( grid.width, y * mural.pixelSize - 0.5 );
		}
		grid.context.strokeStyle = '#ccc';
		grid.context.stroke();
	}
};

preview = {

	canvas: null,
	context: null,

	width: null,
	height: null,

	visible: false,

	// SETTERS

	setCanvas: function ( value ) {
		preview.canvas = value;
		preview.context = value.getContext( '2d' );
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

	show: function () {
		if ( mural.pixelSize < 4 ) {
			return;
		}
		preview.visible = true;
		$( preview.canvas ).show();
	},

	hide: function () {
		preview.visible = false;
		$( preview.canvas ).hide();
	},

	toggle: function () {
		preview.visible ? preview.hide() : preview.show();
	},

	update: function () {
		if ( mural.pixelSize < 4 ) {
			preview.hide();
			return;
		}
		var data = {
			'width': preview.width,
			'height': preview.height,
			'centerX': mural.centerX,
			'centerY': mural.centerY,
			'pixelSize': 1,
			'format': 'base64'
		};
		$.get( 'Areas', data, function ( response ) {
			//console.log( response );
			var image = new Image();
			image.src = 'data:image/png;base64,' + response;
			image.onload = function () {
				preview.context.clearRect( 0, 0, preview.width, preview.height );
				preview.context.drawImage( image, 0, 0 );
			};
		});
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
	this.brush = 0;
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

	this.getData = function () {
		return {
			'id': this.id,
			'facebook_id': this.facebook_id,
			'insert_time': this.insert_time,
			'update_time': this.update_time,
			'name': this.name,
			'email': this.email,
			'gender': this.gender,
			'locale': this.locale,
			'link': this.link,
			'status': this.status,
			'timezone': this.timezone,
		}
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

	this.update = function () {
		$.post( 'Users', this.getData(), function ( response ) {
			//console.log( response );
		});
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

	this.register = function ( oldPixel ) {
		menu.oldPixels.splice( menu.arrayPointer, menu.oldPixels.length - menu.arrayPointer, oldPixel );
		menu.newPixels.splice( menu.arrayPointer, menu.newPixels.length - menu.arrayPointer, this );
		menu.arrayPointer++;
		menu.update();
		return this;
	};

	this.unregister = function () {
		for ( var i = 0; i < menu.oldPixels.length; i++ ) {
			if ( menu.oldPixels[ i ].x === this.x && menu.oldPixels[ i ].y === this.y ) {
				menu.oldPixels.splice( i, 1 );
				menu.newPixels.splice( i, 1 );
				menu.arrayPointer--;
			}
		}
		menu.update();
		return this;
	};

	this.save = function () {
		var data = {
			'x': this.x,
			'y': this.y,
			'color': this.color,
			'tool': menu.activeTool
		};
		$.post( 'Pixels', data, function ( response ) {
			//console.log( response );
			switch ( response.code ) {
				case 401:
				case 403:
					if ( response.data ) {
						var Pixel = new window.Pixel( response.data );
						Pixel.paint().unregister();
					} else {
						var Pixel = new window.Pixel({ 'x': data.x, 'y': data.y });
						Pixel.erase().unregister();
					}
					break;
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
		menu.oldPixels.splice( menu.arrayPointer, menu.oldPixels.length - menu.arrayPointer, oldArea );
		menu.newPixels.splice( menu.arrayPointer, menu.newPixels.length - menu.arrayPointer, this );
		menu.arrayPointer++;
		menu.update();
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

/**
 * Handy functions
 */

function rgb2hex( r, g, b ) {
    return '#' + ( ( 1 << 24 ) + ( r << 16 ) + ( g << 8 ) + b ).toString( 16 ).slice( 1 );
}