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

$( touch.init );