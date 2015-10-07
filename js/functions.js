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

var timeout = null;
function showPixelAuthor( Pixel, Author ) {
	hidePixelAuthor();
	if ( timeout ) {
		clearTimeout( timeout );
	}
	var picture = '<img src="images/anon.png">',
		author = Author.name,
		date = new Date( Pixel.insert_time * 1000 ),
		date = '<br>' + date.toUTCString(),
		link = Author.link ? '<br><a href="' + Author.link + '">' + Author.link + '</a>' : '';
	if ( Author.facebook_id ) {
		picture = '<img src="//graph.facebook.com/' + Author.facebook_id + '/picture">';
		author = '<a href="//www.facebook.com/app_scoped_user_id/' + Author.facebook_id + '/">' + Author.name + '</a>';
	}
	var span = $( '<span>' ).attr( 'id', 'author' ).html( picture + author + date + link );
	$( 'body' ).append( span );
	timeout = setTimeout( hidePixelAuthor, 4000 );
}

function hidePixelAuthor() {
	$( '#author' ).remove();
}

function verifyPayment( data ) {
	//console.log( data );
	$.post( 'FacebookPayments', data, function ( response ) {
		//console.log( response );
		if ( response === 'completed' ) {
			user.stroke = 3;
			tools.update();
		}
	});
}