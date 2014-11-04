$( function () {

	FB.init({
		appId: '707049712677506',
		//frictionlessRequests: true,
		xfbml: true,
		status: true,
		version: 'v2.1'
	});

/*
	FB.getLoginStatus( function( response ) {
		statusChangeCallback( response );
	});
*/
});

/*
function statusChangeCallback( response ) {
	//console.log( response );
	if ( response.status === 'connected' ) {
		FB.api( '/me', function( response ) {
			console.log( response );
			user.name = response.name;
			user.email = response.email;
			user.link = response.link;
			menu.setAlert( 'Welcome ' + response.first_name + '!' );
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
*/