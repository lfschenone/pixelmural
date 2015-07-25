$( function () {

	FB.init({
		appId: '641443202624106',
		xfbml: true,
		status: true,
		cookie: true,
		version: 'v2.3'
	});

	FB.getLoginStatus( statusChangeCallback );

	$( '#facebook-login-button' ).click( function () {
		FB.login( statusChangeCallback );
	});

	$( '#facebook-logout-button' ).click( function () {
		FB.logout( statusChangeCallback );
	});

	$( '#facebook-share-button' ).click( function () {
		FB.XFBML.parse(); // Update the URL to be shared
		FB.ui({ 'method': 'share', 'href': location.href });
	});
});

function statusChangeCallback( response ) {
	//console.log( response );
	$.get( 'tokens', function ( response ) {
		//console.log( response );
		gUser = new User( response ); // Update the global user
	});

	$( '#facebook-login-button' ).show();
	$( '#facebook-logout-button' ).hide();

    if ( response.status === 'connected' ) {
		$( '#facebook-login-button' ).hide();
		$( '#facebook-logout-button' ).show();
    }
}