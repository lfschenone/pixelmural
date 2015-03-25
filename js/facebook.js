window.fbAsyncInit = function () {

	FB.init({
		appId: '707049712677506',
		xfbml: true,
		status: true,
		cookie: true,
		version: 'v2.0'
	});

	$( '#facebook-share-button' ).click( function () {
		FB.XFBML.parse(); // Update the shared URL to the current coordinates
		var data = {
			'method': 'share',
			'href': location.href
		};
		FB.ui( data, function ( response ) {
			console.log( response );
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
			$.get( 'Users/facebookLogin', function ( response ) {
				//console.log( response );
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
			$.get( 'Users/facebookLogout', function ( response ) {
				//console.log( response );
			});
			$( '#facebook-login-button' ).show();
			$( '#facebook-logout-button' ).hide();
		}
	});
}