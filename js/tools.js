tools = {

	color: '#000000',

	stroke: 1,

	// EVENT HANDLERS

	init: function () {
		// Initialize Spectrum
		$( '.color-input' ).spectrum({
			preferredFormat: 'hex',
			showButtons: false,
			show: tools.clickColorButton,
			change: tools.clickColorButton,
			hide: tools.clickColorButton
		});

		// Set the variables that must wait for the DOM to be loaded
		grid.setCanvas( document.getElementById( 'grid' ) );
		preview.setCanvas( document.getElementById( 'preview' ) );
		preview.setWidth( 300 );
		preview.setHeight( 200 );

		tools.bindEvents();

		// Set the pencil as the default action
		tools.clickPencilButton();
	},

	bindEvents: function () {
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
		$( '#stroke-2-price-tag' ).click( facebook.login );
		$( '#stroke-3-price-tag' ).click( tools.clickStroke3PriceTag );

		$( document )
			.bind( 'keypress', 'b', tools.clickBucketButton )
			.bind( 'keypress', 'e', tools.clickEraserButton )
			.bind( 'keypress', 'g', tools.clickGridButton )
			.bind( 'keypress', 'i', tools.clickZoomInButton )
			.bind( 'keypress', 'l', tools.clickLinkButton )
			.bind( 'keypress', 'o', tools.clickZoomOutButton )
			.bind( 'keypress', 'p', tools.clickPencilButton )
			.bind( 'keypress', 'x', tools.clickRedoButton )
			.bind( 'keypress', 'z', tools.clickUndoButton )
			.bind( 'keydown', 'Left', mural.moveLeft )
			.bind( 'keydown', 'Up', mural.moveUp )
			.bind( 'keydown', 'Right', mural.moveRight )
			.bind( 'keydown', 'Down', mural.moveDown )
			.bind( 'keydown', 'Alt', tools.clickDropperButton )
			.bind( 'keyup', 'Left', mural.update )
			.bind( 'keyup', 'Up', mural.update )
			.bind( 'keyup', 'Right', mural.update )
			.bind( 'keyup', 'Down', mural.update )
			.bind( 'keyup', 'Alt', tools.clickPreviousTool );
	},

	clickGridButton: function () {
		grid.toggle();
		grid.update();
		return false;
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

	oldData: [],
	clickUndoButton: function () {
		if ( tools.arrayPointer === 0 ) {
			return; // There's nothing else to undo
		}
		tools.arrayPointer--;
		var oldAreaData = tools.oldData[ tools.arrayPointer ],
			oldArea = new window.Area( oldAreaData );
		oldArea.paint().save();
		tools.update();
	},

	newData: [],
	clickRedoButton: function () {
		if ( tools.arrayPointer === tools.newData.length ) {
			return; // There's nothing else to redo
		}
		var newAreaData = tools.newData[ tools.arrayPointer ],
			newArea = new window.Area( newAreaData );
		tools.arrayPointer++;
		newArea.paint().save();
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
		mouse.downAction = bucket.paintArea;
		mouse.dragAction = null;
		mouse.upAction = null;
		tools.activeTool = 'bucket';
		tools.update();
		return false;
	},

	clickStroke3PriceTag: function () {
		if ( document.referrer === 'https://apps.facebook.com/' ) {
			FB.ui({
				method: 'pay',
				action: 'purchaseitem',
				product: '//pixelmural.com/stroke3.html',
			}, function ( data ) {
				//console.log( data );
				$.post( 'FacebookPayments', data, function ( response ) {
					//console.log( response );
					if ( response === 'completed' ) {
						user.stroke = 3;
						tools.update();
					}
				});
			});
		} else {
			location.href = 'https://apps.facebook.com/pixelmural/';
		}
		return false;
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

	clickColorButton: function ( color ) {
		tools.stroke = $( this ).data( 'stroke' );
		tools.color = color.toHexString();
		tools.update();
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

		if ( tools.arrayPointer === tools.newData.length ) {
			$( '#redo-button' ).addClass( 'disabled' );
		}

		if ( mural.pixelSize < 4 ) {
			$( '#grid-button' ).addClass( 'disabled' );
			$( '#preview-button' ).addClass( 'disabled' );
		}

		$( '.sp-replacer' ).removeClass( 'sp-active' );
		$( '#color-input-' + tools.stroke + ' + .sp-replacer' ).addClass( 'sp-active' );
		$( '#color-input-' + tools.stroke ).spectrum( 'set', tools.color );

		$( '.price-tag' ).hide();
		if ( user.stroke < 2 ) {
			$( '#color-input-2 + .sp-replacer' ).append( $( '#stroke-2-price-tag' ).show() );
		}
		if ( user.stroke < 3 ) {
			$( '#color-input-3 + .sp-replacer' ).append( $( '#stroke-3-price-tag' ).show() );
		}

		$( '.menu button' ).removeClass( 'active' );
		$( '#' + tools.activeTool + '-button' ).addClass( 'active' );

		$( '#color-input' ).spectrum( 'set', tools.color );
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

		var x = mouse.currentX,
			y = mouse.currentY,
			color = tools.color;

		// For convenience, re-painting a pixel erases it
		if ( color === mural.getPixelColor( x, y ) && x === mouse.previousX && y === mouse.previousY ) {
			color = null;
		}

		var newAreaData = [{ 'x': x, 'y': y, 'color': color }];

		if ( tools.stroke > 1 ) {
			newAreaData.push({ 'x': x + 1, 'y': y + 0, 'color': color });
			newAreaData.push({ 'x': x + 0, 'y': y + 1, 'color': color });
			newAreaData.push({ 'x': x + 1, 'y': y + 1, 'color': color });
		}

		if ( tools.stroke > 2 ) {
			newAreaData.push({ 'x': x - 1, 'y': y + 1, 'color': color });
			newAreaData.push({ 'x': x - 1, 'y': y + 0, 'color': color });
			newAreaData.push({ 'x': x - 1, 'y': y - 1, 'color': color });
			newAreaData.push({ 'x': x + 0, 'y': y - 1, 'color': color });
			newAreaData.push({ 'x': x + 1, 'y': y - 1, 'color': color });
		}

		var newArea = new window.Area( newAreaData );
		newArea.paint().save( true );
	}
};

eraser = {

	erasePixel: function ( event ) {

		var x = mouse.currentX,
			y = mouse.currentY
			newAreaData = [{ 'x': x, 'y': y, 'color': null }];

		if ( tools.stroke > 1 ) {
			newAreaData.push({ 'x': x + 1, 'y': y + 0, 'color': null });
			newAreaData.push({ 'x': x + 0, 'y': y + 1, 'color': null });
			newAreaData.push({ 'x': x + 1, 'y': y + 1, 'color': null });
		}

		if ( tools.stroke > 2 ) {
			newAreaData.push({ 'x': x - 1, 'y': y + 1, 'color': null });
			newAreaData.push({ 'x': x - 1, 'y': y + 0, 'color': null });
			newAreaData.push({ 'x': x - 1, 'y': y - 1, 'color': null });
			newAreaData.push({ 'x': x + 0, 'y': y - 1, 'color': null });
			newAreaData.push({ 'x': x + 1, 'y': y - 1, 'color': null });
		}

		var newArea = new window.Area( newAreaData );
		newArea.erase().save( true );
	}
};

dropper = {

	suckColor: function ( event ) {
		tools.color = mural.getPixelColor( mouse.currentX, mouse.currentY );
		tools.update();
	}
};

bucket = {

	paintArea: function ( event ) {
		var x = mouse.currentX,
			y = mouse.currentY,
			color = tools.color,
			oldAreaData = [{ 'x': x, 'y': y, 'color': mural.getPixelColor( x, y ) }],
			newPixelData,
			newPixel,
			newAreaData = [],
			neighbors = [];

		showLoading();
		while ( oldAreaData.length ) {
			oldPixelData = oldAreaData.shift();
			x = oldPixelData.x;
			y = oldPixelData.y;
			newPixelData = { 'x': x, 'y': y, 'color': color };
			newPixel = new window.Pixel( newPixelData );
			newPixel.paint();
			newAreaData.push( newPixelData );
			neighbors = [
				{ 'x': x, 'y': y - 1, 'color': mural.getPixelColor( x, y - 1 ) },
				{ 'x': x + 1, 'y': y, 'color': mural.getPixelColor( x + 1, y ) },
				{ 'x': x, 'y': y + 1, 'color': mural.getPixelColor( x, y + 1 ) },
				{ 'x': x - 1, 'y': y, 'color': mural.getPixelColor( x - 1, y ) }
			];
			neighbors.forEach( function ( neighbor ) {
				if ( neighbor.color && neighbor.color === oldPixelData.color ) {
					for ( var i = 0; i < oldAreaData.length; i++ ) {
						if ( oldAreaData[ i ].x === neighbor.x && oldAreaData[ i ].y === neighbor.y ) {
							return; // Make sure the neighbor is not in oldAreaData already
						}
					}
					oldAreaData.push( neighbor );
				}
			});
		}
		hideLoading();

		var newArea = new window.Area( newAreaData );
		newArea.save( true );
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
	this.color = null;
	this.author_id = null;
	this.insert_time = null;
	this.update_time = null;

	for ( var property in data ) {
		this[ property ] = data[ property ];
	}

	this.getData = function () {
		return { 'x': this.x, 'y': this.y, 'color': this.color };
	}

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

	this.data = data;

	this.paint = function () {
		var pixel;
		this.data.forEach( function ( data ) {
			pixel = new window.Pixel( data );
			pixel.paint();
		});
		return this;
	};

	this.erase = function () {
		var pixel;
		this.data.forEach( function ( data ) {
			pixel = new window.Pixel( data );
			pixel.erase();
		});
		return this;
	};

	this.save = function ( undoable ) {
		var timeout = setTimeout( showLoading, 1000 );
			data = {
				'tool': tools.activeTool,
				'stroke': tools.stroke,
				'area': this.data
			};
		$.post( 'Areas', data, function ( response ) {
			//console.log( response );

			if ( undoable ) {
				tools.oldData.splice( tools.arrayPointer, tools.oldData.length - tools.arrayPointer, response.oldAreaData );
				tools.newData.splice( tools.arrayPointer, tools.newData.length - tools.arrayPointer, response.newAreaData );
				tools.arrayPointer++;
				tools.update();
			}

			var newArea = new window.Area( response.newAreaData );
			newArea.paint();

			clearTimeout( timeout );
			hideLoading();
		});
		return this;
	};
}

$( tools.init );