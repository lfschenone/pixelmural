/**
 * Handy functions
 */

function rgb2hex( r, g, b ) {
    return '#' + ( ( 1 << 24 ) + ( r << 16 ) + ( g << 8 ) + b ).toString( 16 ).slice( 1 );
}

function showLoading() {
	$( '#loading' ).show();
}

function hideLoading() {
	$( '#loading' ).hide();
}

function showPixelAuthor( Pixel, Author ) {
	var picture = '<img src="images/anon.png">',
		author = Author.name,
		date = new Date( Pixel.insert_time * 1000 ),
		date = '<br>' + date.toUTCString();
	if ( Author.facebook_id ) {
		picture = '<img src="http://graph.facebook.com/' + Author.facebook_id + '/picture">';
		author = '<a target="_blank" href="https://www.facebook.com/app_scoped_user_id/' + Author.facebook_id + '/">' + Author.name + '</a>';
	}
	var span = $( '<span>' ).attr( 'id', 'author' ).html( picture + author + date );
	$( 'body' ).append( span );
	window.setTimeout( function () {
		span.remove();
	}, 4000 );
}