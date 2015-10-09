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

	// INITIALISER

	init: function () {
		// Set the variables that must wait for the DOM to be loaded
		mural.setCanvas( document.getElementById( 'mural' ) );
		mural.setCenterX( mural.getCenterX() );
		mural.setCenterY( mural.getCenterY() );
		mural.setPixelSize( mural.getPixelSize() );

		// Fill the mural
		mural.update();

		// Bind events
		$( window ).resize( mural.resize );

		// Initialise dependencies
		mouse.init();
		touch.init();

		// Create a dummy user
		user = new User;
	},

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
	 * Returns the color of a visible pixel
	 */
	getPixelColor: function ( x, y ) {
		var rectX = Math.abs( mural.centerX - Math.floor( mural.xPixels / 2 ) - x ) * mural.pixelSize,
			rectY = Math.abs( mural.centerY - Math.floor( mural.yPixels / 2 ) - y ) * mural.pixelSize,
			imageData = mural.context.getImageData( rectX, rectY, 1, 1 ),
			red   = imageData.data[0],
			green = imageData.data[1],
			blue  = imageData.data[2],
			alpha = imageData.data[3],
			color = alpha ? rgb2hex( red, green, blue ) : null;
		return color;
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

	moveLeft: function () {
		mural.centerX--;
		mural.imageData = mural.context.getImageData( 0, 0, mural.width, mural.height );
		mural.clear();
		mural.context.putImageData( mural.imageData, mural.pixelSize, 0 );
	},

	moveUp: function () {
		mural.centerY--;
		mural.imageData = mural.context.getImageData( 0, 0, mural.width, mural.height );
		mural.clear();
		mural.context.putImageData( mural.imageData, 0, mural.pixelSize );
	},

	moveRight: function () {
		mural.centerX++;
		mural.imageData = mural.context.getImageData( 0, 0, mural.width, mural.height );
		mural.clear();
		mural.context.putImageData( mural.imageData, -mural.pixelSize, 0 );
	},

	moveDown: function () {
		mural.centerY++;
		mural.imageData = mural.context.getImageData( 0, 0, mural.width, mural.height );
		mural.clear();
		mural.context.putImageData( mural.imageData, 0, -mural.pixelSize );
	},

	timeout: null,
	resize: function () {
		clearTimeout( mural.timeout );
		mural.timeout = setTimeout( mural.update, 200 );	
	},

	clear: function () {
		mural.context.clearRect( 0, 0, mural.width, mural.height );
	},

	jqXHR: null, // This will hold the jQuery XMLHTTPRequest object created for every AJAX call
	update: function () {
		if ( mural.jqXHR ) {
			mural.jqXHR.abort(); // Abort any unfinished updates
		}

		mural.setWidth( $( 'body' ).width() );
		mural.setHeight( $( 'body' ).height() );

		showLoading();

		var data = {
			'width': mural.width,
			'height': mural.height,
			'centerX': mural.centerX,
			'centerY': mural.centerY,
			'pixelSize': mural.pixelSize,
			'format': 'base64'
		};
		mural.jqXHR = $.get( 'Areas', data, function ( response ) {
			//console.log( response );
			var image = new Image();
			image.src = 'data:image/png;base64,' + response;
			image.onload = function () {
				mural.context.clearRect( 0, 0, mural.width, mural.height );
				mural.context.drawImage( image, 0, 0 );

				hideLoading();

				// Update the URL of the browser
				var BASE = $( 'base' ).attr( 'href' );
				history.replaceState( null, null, BASE + mural.centerX + '/' + mural.centerY + '/' + mural.pixelSize );
			};
		});
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

	// INITIALISER
	init: function () {
		// Bind events
		$( mural.canvas ).mousedown( mouse.down ).mousemove( mouse.move ).mouseup( mouse.up );
	},

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
	}
};

touch = {

	// The distance from the origin of the coordinate system in virtual pixels (not real ones)
	currentX: null,
	currentY: null,
	previousX: null,
	previousY: null,
	diffX: null,
	diffY: null,

	// INITIALISER
	init: function () {
		// Bind events
    	$( mural.canvas ).on( 'touchstart', touch.start ).on( 'touchmove', touch.move ).on( 'touchend', touch.end );
	},

	// GETTERS

	getCurrentX: function ( event ) {
		var pageX = event.originalEvent.changedTouches[0].pageX,
			offsetX = pageX - $( event.target ).offset().left - 1, // The -1 is to correct a minor displacement
			currentX = mural.centerX - Math.floor( mural.xPixels / 2 ) + Math.floor( offsetX / mural.pixelSize );
		return currentX;
	},

	getCurrentY: function ( event ) {
		var pageY = event.originalEvent.changedTouches[0].pageY,
			offsetY = pageY - $( event.target ).offset().top - 2, // The -2 is to correct a minor displacement
			currentY = mural.centerY - Math.floor( mural.yPixels / 2 ) + Math.floor( offsetY / mural.pixelSize );
		return currentY;
	},

	// EVENT HANDLERS

	start: function ( event ) {
		touch.currentX = touch.getCurrentX( event );
		touch.currentY = touch.getCurrentY( event );
		touch.diffX = 0;
		touch.diffY = 0;
		mural.imageData = mural.context.getImageData( 0, 0, mural.width, mural.height );
	},

	move: function ( event ) {
		touch.previousX = touch.currentX;
		touch.previousY = touch.currentY;

		touch.currentX = touch.getCurrentX( event );
		touch.currentY = touch.getCurrentY( event );

		mural.centerX += touch.previousX - touch.currentX;
		mural.centerY += touch.previousY - touch.currentY;

		touch.diffX += ( touch.currentX - touch.previousX ) * mural.pixelSize;
		touch.diffY += ( touch.currentY - touch.previousY ) * mural.pixelSize;

		mural.context.clearRect( 0, 0, mural.width, mural.height );
		mural.context.putImageData( mural.imageData, parseFloat( touch.diffX ), parseFloat( touch.diffY ) );

		// Bugfix: without this, the mural flickers when moving, not sure why
		touch.currentX = touch.getCurrentX( event );
		touch.currentY = touch.getCurrentY( event );
	},

	end: function ( event ) {
		if ( touch.diffX || touch.diffY ) {
			mural.update();
		} else {
			var data = { 'x': touch.currentX, 'y': touch.currentY };
			$.get( 'Pixels', data, function ( response ) {
				if ( response ) {
					showPixelAuthor( response.Pixel, response.Author );
				}
			});
		}
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
			'timezone': this.timezone
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

$( mural.init );