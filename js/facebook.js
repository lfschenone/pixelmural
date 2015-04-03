window.fbAsyncInit = function () {

	FB.init({
		appId: '707049712677506',
		xfbml: true,
		status: true,
		cookie: true,
		version: 'v2.0'
	});

	$( '#facebook-share-button' ).click( function ( event ) {
		//console.log( event );
		var data = { 'centerX': board.centerX, 'centerY': board.centerY, 'pixelSize': board.pixelSize };
		$.get( 'ajax.php?method=saveScreen', data, function ( response ) {
			//console.log( response );
			FB.XFBML.parse(); // Update URL to be shared to the latest coordinates
			var data = { 'method': 'share', 'href': location.href };
			FB.ui( data, function ( response ) {
				//console.log( response );
			});
		});
	});

	$( '#facebook-login-button' ).click( function () {
		FB.login();
	});

	$( '#facebook-logout-button' ).click( function () {
		FB.logout();
	});

	FB.Event.subscribe( 'auth.statusChange', function ( response ) {
		//console.log( response );
	    if ( response.status === 'connected' ) {
			$.get( 'ajax.php?method=facebookLogin', function ( response ) {
				//console.log( response );
				for ( var property in response.user ) {
					user[ property ] = response.user[ property ];
				}
			});
			FB.api( '/me', function ( response ) {
				//console.log( response );
			});
			$( '#facebook-login-button' ).hide();
			$( '#facebook-logout-button' ).show();
	    }
	    if ( response.status === 'not_authorized' ) {
			// What do?
	    }
	    if ( response.status === 'unknown' ) {
			$.get( 'ajax.php?method=facebookLogout', function ( response ) {
				//console.log( response );
				for ( var property in response.user ) {
					user[ property ] = response.user[ property ];
				}
			});
			$( '#facebook-login-button' ).show();
			$( '#facebook-logout-button' ).hide();
		}
	});
}