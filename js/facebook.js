window.fbAsyncInit = function () {

	FB.init({
		appId: '707049712677506',
		xfbml: true,
		status: true,
		cookie: true,
		version: 'v2.0'
	});

	FB.Event.subscribe( 'auth.statusChange', function ( response ) {
		statusChangeCallback( response )
	});

	FB.getLoginStatus( function ( response ) {
		statusChangeCallback( response );
	});

	$( '#facebook-login-button' ).click( function () {
		FB.login();
	});

	$( '#facebook-logout-button' ).click( function () {
		FB.logout();
	});

	$( '#facebook-share-button' ).click( function ( event ) {
		//console.log( event );
		var data = { 'centerX': board.centerX, 'centerY': board.centerY, 'pixelSize': board.pixelSize };
		$.post( 'ajax.php?method=saveFacebookPreview', data, function ( response ) {
			//console.log( response );
			FB.XFBML.parse(); // Update the URL to be shared
			var data = { 'method': 'share', 'href': location.href };
			FB.ui( data, function ( response ) {
				//console.log( response );
				if ( response === [] ) { // [] seems to be the response after a successful share
					gUser.share_count++;
					menu.updateButtons();
					$.post( 'ajax.php?method=facebookShare' ); // Update the database
				}
			});
		});
	});
}

function statusChangeCallback( response ) {
	//console.log( response );
    if ( response.status === 'connected' ) {
		$.post( 'ajax.php?method=facebookLogin', function ( response ) {
			//console.log( response );
			for ( var property in response.gUser ) {
				gUser[ property ] = response.gUser[ property ];
			}
			menu.updateButtons();
		});
    }

    if ( response.status === 'not_authorized' ) {
		// What do?
    }

    if ( response.status === 'unknown' ) {
		$.post( 'ajax.php?method=facebookLogout', function ( response ) {
			//console.log( response );
			for ( var property in response.gUser ) {
				gUser[ property ] = response.gUser[ property ];
			}
			menu.updateButtons();
		});
	}
}