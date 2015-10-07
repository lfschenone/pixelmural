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
		$( '#facebook-share-button' ).click( facebook.share );
		$( '#facebook-login-button' ).click( facebook.login );
		$( '#facebook-logout-button' ).click( facebook.logout );
	},

	login: function ( event ) {
		FB.login( facebook.statusChangeCallback );
		return false;
	},

	logout: function () {
		FB.logout( facebook.statusChangeCallback );
	},

	share: function () {
		FB.XFBML.parse(); // Update the URL to be shared
		FB.ui({ 'method': 'share', 'href': location.href });
	},

	statusChangeCallback: function ( response ) {
		//console.log( response );
		// First get a token
		$.get( 'Tokens', function ( response ) {
			//console.log( response );
			// Then use the token to update the user object
			$.get( 'Users', { 'token': response }, function ( response ) {
				//console.log( response );

				user = new User( response );

				if ( tools ) {
					tools.update();
				}

				// Part of the payment flow
				if ( document.referrer === 'https://apps.facebook.com/pixelmural/?buy=stroke3' ) {
					if ( user.stroke === 3 ) {
						return; // If the user already has stroke 3, don't try to sell it again
					}
					FB.ui({
						method: 'pay',
						action: 'purchaseitem',
						product: '//pixelmural.com/stroke3.html',
					}, verifyPayment );
				}
			});
		});
		if ( response.status === 'connected' ) {
			$( '#facebook-login-button' ).hide();
			$( '#facebook-logout-button' ).show();
			$( '#profile-picture' ).attr( 'src', '//graph.facebook.com/' + response.authResponse.userID + '/picture' );
    	} else {
			$( '#facebook-login-button' ).show();
			$( '#facebook-logout-button' ).hide();
			$( '#profile-picture' ).attr( 'src', 'images/anon.png' );
    	}
	}
};

$( facebook.init );