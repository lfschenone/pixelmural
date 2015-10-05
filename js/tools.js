tools = {

	color: '#000000',

	stroke: 1,

	// EVENT HANDLERS

	init: function () {
		// Initialize Spectrum
		$( '.color-input' ).spectrum({
			preferredFormat: 'hex',
			showButtons: false,
			show: function ( color ) {
				tools.stroke = $( this ).data( 'stroke' );
				tools.color = color.toHexString();
			},
			change: function ( color ) {
				tools.stroke = $( this ).data( 'stroke' );
				tools.color = color.toHexString();
			},
			hide: function ( color ) {
				tools.stroke = $( this ).data( 'stroke' );
				tools.color = color.toHexString();
			}
		});

		// Set the variables that must wait for the DOM to be loaded
		grid.setCanvas( document.getElementById( 'grid' ) );
		preview.setCanvas( document.getElementById( 'preview' ) );
		preview.setWidth( 300 );
		preview.setHeight( 200 );

		// Set 'move' as the default action
		tools.bindEvents();
		tools.clickMoveButton();
	},

	bindEvents: function () {
		$( '#move-button' ).click( tools.clickMoveButton );
		$( '#grid-button' ).click( tools.clickGridButton );
		$( '#preview-button' ).click( tools.clickPreviewButton );
		$( '#zoom-in-button' ).click( tools.clickZoomInButton );
		$( '#zoom-out-button' ).click( tools.clickZoomOutButton );
		$( '#undo-button' ).click( tools.clickUndoButton );
		$( '#redo-button' ).click( tools.clickRedoButton );
		$( '#link-button' ).click( tools.clickLinkButton );
		$( '#pencil-button' ).click( tools.clickPencilButton );
		$( '#eraser-button' ).click( tools.clickEraserButton );
		$( '#dropper-button' ).click( tools.clickDropperButton );
		$( '#bucket-button' ).click( tools.clickBucketButton );

		$( document ).bind( 'keypress', 'Space', tools.clickMoveButton );
		$( document ).bind( 'keypress', 'b', tools.clickBucketButton );
		$( document ).bind( 'keypress', 'c', tools.clickColorButton );
		$( document ).bind( 'keypress', 'e', tools.clickEraserButton );
		$( document ).bind( 'keypress', 'g', tools.clickGridButton );
		$( document ).bind( 'keypress', 'i', tools.clickZoomInButton );
		$( document ).bind( 'keypress', 'l', tools.clickLinkButton );
		$( document ).bind( 'keypress', 'o', tools.clickZoomOutButton );
		$( document ).bind( 'keypress', 'p', tools.clickPencilButton );
		$( document ).bind( 'keypress', 'x', tools.clickRedoButton );
		$( document ).bind( 'keypress', 'z', tools.clickUndoButton );
		$( document ).bind( 'keydown', 'Left', mural.moveLeft );
		$( document ).bind( 'keydown', 'Up', mural.moveUp );
		$( document ).bind( 'keydown', 'Right', mural.moveRight );
		$( document ).bind( 'keydown', 'Down', mural.moveDown );
		$( document ).bind( 'keydown', 'Alt', tools.clickDropperButton );
		$( document ).bind( 'keyup', 'Alt', tools.clickPreviousTool );
		$( document ).bind( 'keyup', 'Left', mural.update );
		$( document ).bind( 'keyup', 'Up', mural.update );
		$( document ).bind( 'keyup', 'Right', mural.update );
		$( document ).bind( 'keyup', 'Down', mural.update );
	},

	clickMoveButton: function () {
		mouse.downAction = move.down;
		mouse.dragAction = move.drag;
		mouse.upAction = move.up;
		tools.activeTool = 'move';
		tools.update();
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
		tools.update();
		grid.update();
	},

	clickZoomOutButton: function () {
		mural.zoomOut();
		tools.update();
		grid.update();
	},

	/**
	 * Undo/redo functionality
	 */
	arrayPointer: 0,

	oldPixels: [],
	clickUndoButton: function () {
		if ( tools.arrayPointer === 0 ) {
			return; // There's nothing else to undo
		}
		tools.arrayPointer--;
		var oldPixels = tools.oldPixels[ tools.arrayPointer ];
		oldPixels.paint().save();
		tools.update();
	},

	newPixels: [],
	clickRedoButton: function () {
		if ( tools.arrayPointer === tools.newPixels.length ) {
			return; // There's nothing else to redo
		}
		var newPixels = tools.newPixels[ tools.arrayPointer ];
		tools.arrayPointer++;
		newPixels.paint().save();
		tools.update();
	},

	clickDropperButton: function () {
		mouse.downAction = dropper.suckColor;
		mouse.dragAction = dropper.suckColor;
		mouse.upAction = null;
		tools.previousTool = tools.activeTool;
		tools.activeTool = 'dropper';
		tools.update();
	},

	clickPencilButton: function () {
		mouse.downAction = pencil.down;
		mouse.dragAction = pencil.drag;
		mouse.upAction = pencil.up;
		tools.activeTool = 'pencil';
		tools.update();
	},

	clickLinkButton: function () {
		var link = ''; // Default
		if ( user.link ) {
			link = user.link;
		}
		result = prompt( 'Link all your pixels to the following URL:', link );
		if ( result === null ) {
			return; // The user pressed cancel
		}
		user.link = result;
		user.update();
	},

	clickEraserButton: function () {
		mouse.downAction = eraser.erasePixel;
		mouse.dragAction = eraser.erasePixel;
		mouse.upAction = null;
		tools.activeTool = 'eraser';
		tools.update();
	},

	clickBucketButton: function () {
		mouse.downAction = null;
		mouse.dragAction = null;
		mouse.upAction = bucket.paintArea;
		tools.activeTool = 'bucket';
		tools.update();
	},

	clickColorButton: function () {
		$( '#color-input' ).spectrum( 'toggle' );
	},

	activeTool: null,
	previousTool: null,
	clickPreviousTool: function () {
		if ( tools.previousTool === 'pencil' ) {
			tools.clickPencilButton();
		}
		if ( tools.previousTool === 'bucket' ) {
			tools.clickBucketButton();
		}		
	},

	// INTERFACE ACTIONS

	update: function () {
		// First enable all the buttons, then disable the ones that should be disabled
		$( '.menu button' ).removeClass( 'disabled' );

		if ( mural.pixelSize === 64 ) {
			$( '#zoom-in-button' ).addClass( 'disabled' );
		}

		if ( mural.pixelSize === 1 ) {
			$( '#zoom-out-button' ).addClass( 'disabled' );
		}

		if ( tools.arrayPointer === 0 ) {
			$( '#undo-button' ).addClass( 'disabled' );
		}

		if ( tools.arrayPointer === tools.newPixels.length ) {
			$( '#redo-button' ).addClass( 'disabled' );
		}

		if ( mural.pixelSize < 4 ) {
			$( '#grid-button' ).addClass( 'disabled' );
			$( '#preview-button' ).addClass( 'disabled' );
		}

		$( '.menu button' ).removeClass( 'active' );
		$( '#' + tools.activeTool + '-button' ).addClass( 'active' );

		$( '#color-input' ).spectrum( 'set', tools.color );
	}
};

move = {

	down: function () {
		mouse.diffX = 0;
		mouse.diffY = 0;
		mural.imageData = mural.context.getImageData( 0, 0, mural.width, mural.height );
	},

	drag: function ( event ) {
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

	up: function ( event ) {
		if ( mouse.diffX || mouse.diffY ) {
			mural.update();
			preview.update();
			return;
		}
		var data = { 'x': mouse.currentX, 'y': mouse.currentY };
		$.get( 'Pixels', data, function ( response ) {
			if ( response ) {
				showPixelAuthor( response.Pixel, response.Author );
			}
		});
	}
};

pencil = {

	down: function () {
		mouse.diffX = 0;
		mouse.diffY = 0;
		mural.imageData = mural.context.getImageData( 0, 0, mural.width, mural.height );
	},

	drag: function ( event ) {
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

	up: function ( event ) {
		if ( mouse.diffX || mouse.diffY ) {
			mural.update();
			preview.update();
			return;
		}

		var oldPixel = mural.getPixel( mouse.currentX, mouse.currentY ),
			newPixel = new Pixel({ 'x': mouse.currentX, 'y': mouse.currentY, 'color': tools.color });

		if ( newPixel.color === oldPixel.color && mouse.currentX === mouse.previousX && mouse.currentY === mouse.previousY ) {
			newPixel.color = null; // For convenience, re-painting a pixel erases it
		}

		newPixel.paint().save().register( oldPixel );
	}
};

eraser = {

	erasePixel: function ( event ) {
		var oldPixel = mural.getPixel( mouse.currentX, mouse.currentY );

		if ( oldPixel.color === null ) {
			return; // The pixel doesn't exist, no need to continue
		}

		var newPixel = new Pixel({ 'x': mouse.currentX, 'y': mouse.currentY });

		newPixel.erase().save().register( oldPixel );
	}
};

dropper = {

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
	}
};

bucket = {

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
		tools.oldPixels.splice( tools.arrayPointer, tools.oldPixels.length - tools.arrayPointer, oldPixel );
		tools.newPixels.splice( tools.arrayPointer, tools.newPixels.length - tools.arrayPointer, this );
		tools.arrayPointer++;
		tools.update();
		return this;
	};

	this.unregister = function () {
		for ( var i = 0; i < tools.oldPixels.length; i++ ) {
			if ( tools.oldPixels[ i ].x === this.x && tools.oldPixels[ i ].y === this.y ) {
				tools.oldPixels.splice( i, 1 );
				tools.newPixels.splice( i, 1 );
				tools.arrayPointer--;
			}
		}
		tools.update();
		return this;
	};

	/**
	 * Contacts the server to save the current pixel data
	 *
	 * When starting a request, we set a timeout that after one second fires the loading icon.
	 * If the server responds in less than a second, the timeout is cleared and the loading icon is never shown.
	 * But if the connection dies or delays too much, the icon is shown and the user won't continue drawing in vain. Probably.
	 */
	this.save = function () {
		var timeout = setTimeout( showLoading, 1000 ), // Show the loading icon after one second
			data = {
			'x': this.x,
			'y': this.y,
			'color': this.color,
			'tool': tools.activeTool
		};
		$.post( 'Pixels', data, function ( response ) {
			clearTimeout( timeout ); // On success, cancel the timeout we set above
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
		tools.oldPixels.splice( tools.arrayPointer, tools.oldPixels.length - tools.arrayPointer, oldArea );
		tools.newPixels.splice( tools.arrayPointer, tools.newPixels.length - tools.arrayPointer, this );
		tools.arrayPointer++;
		tools.update();
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

$( tools.init );