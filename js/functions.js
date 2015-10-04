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