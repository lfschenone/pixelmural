$( function () {

	// Initialize Spectrum
	$( '#color-input' ).spectrum({
		preferredFormat: 'hex',
		showButtons: false,
		show: function ( color ) {
			tools.color = color.toHexString();
		},
		change: function ( color ) {
			tools.color = color.toHexString();
		},
		hide: function ( color ) {
			tools.color = color.toHexString();
		}
	}).next().attr( 'title', 'Color [C]' );

	// Set the variables that must wait for the DOM to be loaded
	grid.setCanvas( document.getElementById( 'grid' ) );
	preview.setCanvas( document.getElementById( 'preview' ) );
	preview.setWidth( 300 );
	preview.setHeight( 200 );

	// Set 'move' as the default action
	tools.bindEvents();
	tools.clickMoveButton();
});

tools = {

	color: '#000000',

	// EVENT HANDLERS

	bindEvents: function () {
		$( '#move-button' ).click( tools.clickMoveButton );
		$( '#grid-button' ).click( tools.clickGridButton );
		$( '#preview-button' ).click( tools.clickPreviewButton );
		$( '#zoom-in-button' ).click( tools.clickZoomInButton );
		$( '#zoom-out-button' ).click( tools.clickZoomOutButton );
		$( '#undo-button' ).click( tools.clickUndoButton );
		$( '#redo-button' ).click( tools.clickRedoButton );
		//$( '#link-button' ).click( tools.clickLinkButton );
		$( '#pencil-button' ).click( tools.clickPencilButton );
		$( '#brush-button' ).click( tools.clickBrushButton );
		$( '#eraser-button' ).click( tools.clickEraserButton );
		$( '#dropper-button' ).click( tools.clickDropperButton );
		$( '#bucket-button' ).click( tools.clickBucketButton );

		$( document ).bind( 'keydown', 'Space', tools.clickMoveButton );
		$( document ).bind( 'keydown', 'b', tools.clickBucketButton );
		$( document ).bind( 'keydown', 'c', tools.clickColorButton );
		$( document ).bind( 'keydown', 'd', tools.clickDropperButton );
		$( document ).bind( 'keydown', 'e', tools.clickEraserButton );
		$( document ).bind( 'keydown', 'g', tools.clickGridButton );
		$( document ).bind( 'keydown', 'i', tools.clickZoomInButton );
		//$( document ).bind( 'keydown', 'l', tools.clickLinkButton );
		$( document ).bind( 'keydown', 'o', tools.clickZoomOutButton );
		$( document ).bind( 'keydown', 'p', tools.clickPencilButton );
		$( document ).bind( 'keydown', 'v', tools.clickBrushButton );
		$( document ).bind( 'keydown', 'x', tools.clickRedoButton );
		$( document ).bind( 'keydown', 'z', tools.clickUndoButton );
		$( document ).bind( 'keydown', 'Left', mural.moveLeft );
		$( document ).bind( 'keydown', 'Up', mural.moveUp );
		$( document ).bind( 'keydown', 'Right', mural.moveRight );
		$( document ).bind( 'keydown', 'Down', mural.moveDown );
		$( document ).bind( 'keydown', 'Alt', mural.clickDropperButton );
		$( document ).bind( 'keyup', 'Alt', mural.clickPreviousTool );
		$( document ).bind( 'keyup', 'Left', mural.update );
		$( document ).bind( 'keyup', 'Up', mural.update );
		$( document ).bind( 'keyup', 'Right', mural.update );
		$( document ).bind( 'keyup', 'Down', mural.update );
	},

	clickMoveButton: function () {
		mouse.downAction = mouse.moveMural1;
		mouse.dragAction = mouse.moveMural2;
		mouse.upAction = mouse.moveMural3;
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
		mouse.downAction = mouse.suckColor;
		mouse.dragAction = mouse.suckColor;
		mouse.upAction = null;
		tools.previousTool = tools.activeTool;
		tools.activeTool = 'dropper';
		tools.update();
	},

	clickPencilButton: function () {
		mouse.downAction = mouse.paintPixel;
		mouse.dragAction = null;
		mouse.upAction = null;
		tools.activeTool = 'pencil';
		tools.update();
	},

	clickBrushButton: function () {
		mouse.downAction = mouse.paintPixel;
		mouse.dragAction = mouse.paintPixel;
		mouse.upAction = null;
		tools.activeTool = 'brush';
		tools.update();
	},

	clickEraserButton: function () {
		mouse.downAction = mouse.erasePixel;
		mouse.dragAction = mouse.erasePixel;
		mouse.upAction = null;
		tools.activeTool = 'eraser';
		tools.update();
	},

	clickBucketButton: function () {
		mouse.downAction = mouse.paintArea;
		mouse.dragAction = null;
		mouse.upAction = null;
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
		if ( tools.previousTool === 'brush' ) {
			tools.clickBrushButton();
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