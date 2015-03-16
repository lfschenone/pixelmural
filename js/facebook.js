window.fbAsyncInit = function () {

	FB.init({
		appId: '707049712677506',
		xfbml: true,
		status: true,
		cookie: true,
		version: 'v2.0'
	});

	$( '#facebookShareButton' ).click( function () {
		var data = {
			'method': 'share',
			'href': $( 'meta[property="og:url"]' ).attr( 'content' )
		};
		FB.ui( data, function ( response ) {
			console.log( response );
		});
		return false;
	});

	$( '#facebookLoginButton' ).click( function () {
		FB.login();
	});

	$( '#facebookLogoutButton' ).click( function () {
		FB.logout();
	});

	FB.Event.subscribe( 'auth.statusChange', function ( response ) {
		handleResponse( response );
	});
}

function handleResponse( response ) {
	//console.log( response );
    if ( response.status === 'connected' ) {
		$.get( 'Users/facebookLogin', function ( response ) {
			//console.log( response );
		});
		FB.api( '/me', function ( response ) {
			//console.log( response );
			user.name = response.name;
			user.email = response.email;
		});
		$( '#facebookLoginButton' ).hide();
		$( '#facebookLogoutButton' ).show();
    }
    if ( response.status === 'not_authorized' ) {
		//What do?
    }
    if ( response.status === 'unknown' ) {
		$.get( 'Users/facebookLogout', function ( response ) {
			//console.log( response );
		});
		$( '#facebookLoginButton' ).show();
		$( '#facebookLogoutButton' ).hide();
	}
}
