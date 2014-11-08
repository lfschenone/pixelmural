$( function () {

window.fbAsyncInit = FB.init({
	appId: '707049712677506',
	oauth: true,
	xfbml: true,
	status: true,
	cookie: true,
	version: 'v2.1'
});

FB.getLoginStatus( function( response ) {

	if ( response.status === 'connected' ) {
		$( '#facebookLoginButton' ).remove();
	}
});

});

function facebookLogin() {
	FB.login( function( response ) {

		if ( response.authResponse ) {
			console.log( response );
			access_token = response.authResponse.accessToken;
			user_id = response.authResponse.userID;

			FB.api( '/me', function( response ) {
				user_email = response.email;
				// You can store this data into your database             
			});
		} else {
			// User cancelled login or did not fully authorize	
		}
	}, { scope: 'publish_stream,email' });
}