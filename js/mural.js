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
	 * Build a basic pixel object out of the coordinates and the color
	 *
	 * The color is sucked directly from the canvas, not the database,
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

	// EVENTS

	onTouchMove: function ( jGesturesObject ) {
		console.log( jGesturesObject );
	},

	onTouchEnd: function ( jGesturesObject ) {
		console.log( jGesturesObject );
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

		mural.setWidth( window.outerWidth );
		mural.setHeight( window.outerHeight );

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

$( mural.init );