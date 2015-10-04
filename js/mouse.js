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

		// Bugfix: without this, the mural flickers when moving, not sure why
		mouse.currentX = mouse.getCurrentX( event );
		mouse.currentY = mouse.getCurrentY( event );
	},

	moveMural3: function ( event ) {
		if ( mouse.diffX || mouse.diffY ) {
			mural.update();
			preview.update();
		} else {
			var data = { 'x': mouse.currentX, 'y': mouse.currentY };
			$.get( 'Pixels', data, function ( response ) {
				if ( response ) {
					showPixelAuthor( response.Pixel, response.Author );
				}
			});
		}
	},

	paintPixel: function ( event ) {
		var oldPixel = mural.getPixel( mouse.currentX, mouse.currentY ),
			newPixel = new Pixel({ 'x': mouse.currentX, 'y': mouse.currentY, 'color': tools.color });

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
		tools.color = rgb2hex( red, green, blue );
		tools.update();
	},

	paintArea: function ( event ) {
		showLoading();
		var data = {
			'x': mouse.currentX,
			'y': mouse.currentY,
			'color': tools.color
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
			hideLoading();
		});
	}
};

$( mouse.init );