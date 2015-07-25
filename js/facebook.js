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

	$( '#pixels-button' ).click( function () {
		FB.ui({
			method: 'pay',
			action: 'purchaseitem',
			product: 'http://pixelbypixel.co/pixel.html',
			quantity: 500,
		});
	});
});

function statusChangeCallback( response ) {
	//console.log( response );
	$.get( 'tokens', function ( response ) {
		//console.log( response );
		gUser = new User( response ); // Update the global user
		menu.updateButtons();
	});

	$( '#facebook-login-button' ).show();
	$( '#facebook-logout-button' ).hide();

    if ( response.status === 'connected' ) {
		$( '#facebook-login-button' ).hide();
		$( '#facebook-logout-button' ).show();
    }
}