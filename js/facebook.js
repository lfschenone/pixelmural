window.fbAsyncInit = function () {

	FB.init({
		appId: '707049712677506',
		xfbml: true,
		status: true,
		cookie: true,
		version: 'v2.0'
	});

	FB.Event.subscribe( 'auth.statusChange', statusChangeCallback );
	FB.getLoginStatus( statusChangeCallback );

	$( '#facebook-login-button' ).click( function () {
		FB.login();
	});

	$( '#facebook-logout-button' ).click( function () {
		FB.logout();
	});

	$( '#facebook-share-button' ).click( function () {
		FB.XFBML.parse(); // Update the URL to be shared
		FB.ui({ 'method': 'share', 'href': location.href });
	});
}

function statusChangeCallback( response ) {
	//console.log( response );
	$.get( 'tokens', function ( response ) {
		//console.log( response );
		// Set the global user with the data from the response
		gUser = new User( response );
	});

	$( '#facebook-login-button' ).show();
	$( '#facebook-logout-button' ).hide();
	$( '#brush-button' ).addClass( 'disabled' ).attr( 'title', 'Log in to activate the brush' );

    if ( response.status === 'connected' ) {
		$( '#facebook-login-button' ).hide();
		$( '#facebook-logout-button' ).show();
		$( '#brush-button' ).removeClass( 'disabled' ).attr( 'title', 'Brush' );
    }
}