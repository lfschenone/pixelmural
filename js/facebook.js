$( function () {

	FB.init({
		appId: FACEBOOK_APP_ID,
		xfbml: true,
		status: true,
		cookie: true,
		version: 'v2.4'
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

	$( '#price-tag' ).click( function () {
		if ( document.referrer.indexOf( 'https://apps.facebook.com/pixelmural/' ) === 0 ) {
			FB.ui({
				method: 'pay',
				action: 'purchaseitem',
				product: 'https://pixelmural.com/brush.html',
			}, verifyPayment );
		} else {
			FB.login( function ( response ) {
				if ( response.status === 'connected' ) {
					location.href = 'https://apps.facebook.com/pixelmural/?buy=brush';
				}
			});
		}
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

			// Part of the payment flow
			if ( document.referrer === 'https://apps.facebook.com/pixelmural/?buy=brush' ) {
				if ( user.brush ) {
					return; // If the user already has the brush, don't try to sell it again
				}
				FB.ui({
					method: 'pay',
					action: 'purchaseitem',
					product: 'https://pixelmural.com/brush.html',
				}, verifyPayment );
			}
		})
	});
}

function verifyPayment( data ) {
	//console.log( data );
	$.post( 'FacebookPayments', data, function ( response ) {
		//console.log( response );
		if ( response === 'completed' ) {
			user.brush = 1;
			menu.update();
			menu.clickBrushButton();
		}
	});
}