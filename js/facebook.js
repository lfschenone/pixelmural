$( function () {

	FB.init({
		appId: FACEBOOK_APP_ID,
		xfbml: true,
		status: true,
		cookie: true,
		version: 'v2.4'
	});

	FB.getLoginStatus( statusChangeCallback );

	$( '#facebook-icon' ).click( function () {
		FB.login( statusChangeCallback );
	});

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

	// First get a token
	$.get( 'Tokens', function ( response ) {
		//console.log( response );

		// Then use the token to update the user object
		$.get( 'Users', { 'token': response }, function ( response ) {
			//console.log( response );
			user = new User( response );
			menu.update();
		})
	});
}