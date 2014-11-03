$( function () {

	FB.init({
		appId: '707049712677506',
		frictionlessRequests: true,
		status: true,
		version: 'v2.1'
	});
	
	FB.Event.subscribe( 'auth.authResponseChange', onAuthResponseChange );
	FB.Event.subscribe( 'auth.statusChange', onStatusChange );
});

function login( callback ) {
	FB.login( callback );
}

function loginCallback( response ) {
	console.log( 'loginCallback', response );
	if ( response.status != 'connected' ) {
		top.location.href = 'https://www.facebook.com/appcenter/YOUR_APP_NAMESPACE';
	}
}

function onStatusChange( response ) {
	if ( response.status != 'connected' ) {
		login( loginCallback );
	} else {
		showHome();
	}
}

function onAuthResponseChange( response ) {
	console.log( 'onAuthResponseChange', response );
}

/*
function statusChangeCallback( response ) {
	console.log( response );
	if ( response.status === 'connected' ) {
		document.getElementById( 'alert' ).innerHTML = 'Logged in!';
		FB.api( '/me', function( response ) {
			user.id = response.id;
			user.name = response.name;
			user.email = response.email;
			user.link = response.link;
		});
	} else if ( response.status === 'not_authorized' ) {
		menu.setAlert( 'Please log into this app.' );
	} else {
		menu.setAlert( 'Please log into Facebook.' );
	}
}

// This function is called when someone finishes with the Login Button
// See the onlogin handler attached to the button in the HTML
function checkLoginState() {
	FB.getLoginStatus( function( response ) {
		statusChangeCallback( response );
	});
}

window.fbAsyncInit = function() {
	FB.init({
		appId: '707049712677506',
		cookie: true, // Enable cookies to allow the server to access the session
		xfbml: true, // Parse social plugins on this page
		version: 'v2.1' // Use version 2.1
	});

	// Now that we've initialized the JavaScript SDK, we call 
	// FB.getLoginStatus(). This function gets the state of the
	// person visiting this page and can return one of three states to
	// the callback you provide. They can be:
	//
	// 1. Logged into your app ('connected')
	// 2. Logged into Facebook, but not your app ('not_authorized')
	// 3. Not logged into Facebook and can't tell if they are logged into your app or not.
	//
	// These three cases are handled in the callback function.
	FB.getLoginStatus( function( response ) {
		statusChangeCallback( response );
	});
};

( function( d, s, id ) {
	var js, fjs = d.getElementsByTagName( s )[0];
	if ( d.getElementById( id ) ) {
		return;
	}
	js = d.createElement( s ); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore( js, fjs );
} ( document, 'script', 'facebook-jssdk' ) );
*/