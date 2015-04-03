function rgb2hex( r, g, b ) {
    return '#' + ( ( 1 << 24 ) + ( r << 16 ) + ( g << 8 ) + b ).toString( 16 ).slice( 1 );
}

function roundSeconds( seconds ) {
	var years, months, weeks, days, hours, minutes;
	if ( years = Math.floor( seconds / ( 60 * 60 * 24 * 365 ) ) ) {
		return years + ' year' + plural( years );
	}
	if ( months = Math.floor( seconds / ( 60 * 60 * 24 * 30 ) ) ) {
		return months + ' month' + plural( months );
	}
	if ( weeks = Math.floor( seconds / ( 60 * 60 * 24 * 7 ) ) ) {
		return weeks + ' week' + plural( weeks );
	}
	if ( days = Math.floor( seconds / ( 60 * 60 * 24 ) ) ) {
		return days + ' day' + plural( days );
	}
	if ( hours = Math.floor( seconds / ( 60 * 60 ) ) ) {
		return hours + ' hour' + plural( hours );
	}
	if ( minutes = Math.floor( seconds / 60 ) ) {
		return minutes + ' minute' + plural( minutes );
	}
	return seconds + ' second' + plural( seconds );
}

function plural( amount, singular, plural ) {
	( singular === undefined ) ? '' : singular;
	( plural === undefined ) ? 's' : plural;
	return ( amount === 1 ) ? singular : plural;
}