<?php

function __autoload( $class ) {
	if ( file_exists( 'controllers/' . $class . '.php' ) ) {
		include 'controllers/' . $class . '.php';
	}
	if ( file_exists( 'models/' . $class . '.php' ) ) {
		include 'models/' . $class . '.php';
	}
	if ( file_exists( 'includes/' . $class . '.php' ) ) {
		include 'includes/' . $class . '.php';
	}
}

function go( $url ) {
	header( 'Location: ' . $url );
	exit;
}

function GET( $key, $default = '' ) {
	if ( array_key_exists( $key, $_GET ) ) {
		return $_GET[ $key ];
	}
	return $default;
}

function POST( $key, $default = '' ) {
	if ( array_key_exists( $key, $_POST ) ) {
		return $_POST[ $key ];
	}
	return $default;
}

function COOKIE( $key, $default = '' ) {
	if ( array_key_exists( $key, $_COOKIE ) ) {
		return $_COOKIE[ $key ];
	}
	return $default;
}

function SESSION( $key, $default = '' ) {
	if ( array_key_exists( $key, $_SESSION ) ) {
		return $_SESSION[ $key ];
	}
	return $default;
}

function plural( $amount, $singular = '', $plural = 's' ) {
	if ( $amount == 1 ) {
		return $singular;
	}
	return $plural;
}

function round_seconds( $seconds ) {
	if ( $years = floor( $seconds / ( 60 * 60 * 24 * 365 ) ) ) {
		return $years . ' year' . plural( $years );
	}
	if ( $months = floor( $seconds / ( 60 * 60 * 24 * 30 ) ) ) {
		return $months . ' month' . plural( $months );
	}
	if ( $weeks = floor( $seconds / ( 60 * 60 * 24 * 7 ) ) ) {
		return $weeks . ' week' . plural( $weeks );
	}
	if ( $days = floor( $seconds / ( 60 * 60 * 24 ) ) ) {
		return $days . ' day' . plural( $days );
	}
	if ( $hours = floor( $seconds / ( 60 * 60 ) ) ) {
		return $hours . ' hour' . plural( $hours );
	}
	if ( $minutes = floor( $seconds / 60 ) ) {
		return $minutes . ' minute' . plural( $minutes );
	}
	return $seconds . ' second' . plural( $seconds );
}

function round_bytes( $bytes, $precision = 1 ) { 
	$UNITS = array( 'B', 'KB', 'MB', 'GB', 'TB' );
	$bytes = max( $bytes, 0 );
	$power = floor( ( $bytes ? log( $bytes ) : 0 ) / log( 1024 ) );
	$power = min( $power, count( $UNITS ) - 1 );
	$bytes = $bytes / pow( 1024, $power );
	return round( $bytes, $precision ) . ' ' . $UNITS[ $power ];
}

function is_ip( $string ) {
	if ( filter_var( $string, FILTER_VALIDATE_IP ) ) {
		return true;
	}
	return false;
}

function is_url( $string ) {
	if ( filter_var( $string, FILTER_VALIDATE_URL ) ) {
		return true;
	}
	return false;
}

function is_email( $string ) {
	if ( filter_var( $string, FILTER_VALIDATE_EMAIL ) ) {
		return true;
	}
	return false;
}

function is_odd( $number ) {
	if ( $number % 2 ) {
		return true;
	}
	return false;
}

function is_even( $number ) {
	if ( $number % 2 ) {
		return false;
	}
	return true;
}

function url_merge( $key, $value ) {
	$url = $_SERVER['REQUEST_URI'];
	$parts = explode( '?', $url, 2 );

	//If $parts[1] exists, it means that there was a query string
	if ( array_key_exists( 1, $parts ) ) {

		//Turn the query string into an array
		parse_str( $parts[1], $array );

		//Merge the array with the new key and value
		$array = array_merge( $array, array( $key => $value ) );

		//Turn the array back into a query string
		$query = http_build_query( $array );

		//Put the url back together
		$url = $parts[0] . '?' . $query;

	} else {
		$url = $parts[0] . '?' . $key . '=' . urlencode( $value );
	}
	return $url;
}