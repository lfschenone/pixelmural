facebook = {

	init: function () {
		FB.init({
			appId: FACEBOOK_APP_ID,
			xfbml: true,
			status: true,
			cookie: true,
			version: 'v2.4'
		});
		FB.getLoginStatus( facebook.statusChangeCallback );

		// Bind events
		$( '#facebook-icon' ).click( facebook.login );
		$( '#facebook-login-button' ).click( facebook.login );
		$( '#facebook-logout-button' ).click( facebook.logout );
		$( '#facebook-share-button' ).click( facebook.share );
	},

	login: function () {
		FB.login( facebook.statusChangeCallback );
	},

	logout: function () {
		FB.logout( facebook.statusChangeCallback );
	},

	share: function () {
		FB.XFBML.parse(); // Update the URL to be shared
		FB.ui({ 'method': 'share', 'href': location.href });
	},

	statusChangeCallback: function ( response ) {
		if ( response.status === 'connected' ) {
			$( '#facebook-icon' ).hide();
			$( '#facebook-login-button' ).hide();
			$( '#facebook-logout-button' ).show();
			$( '#profile-picture' ).attr( 'src', 'http://graph.facebook.com/' + response.authResponse.userID + '/picture' );
    	} else {
    		$( '#facebook-icon' ).show();
			$( '#facebook-login-button' ).show();
			$( '#facebook-logout-button' ).hide();
			$( '#profile-picture' ).attr( 'src', 'images/anon.png' );
    	}
	},
};

$( facebook.init );