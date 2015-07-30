<?php

function json( $data ) {
	header( 'Content-Type: application/json' );
	echo json_encode( $data, JSON_NUMERIC_CHECK );
	exit;
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

function is_mobile() {
	return preg_match( "/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"] );
}

function pr( $ARRAY ) {
	echo '<pre>';
	print_r( $ARRAY );
	echo '</pre>';
}

/**
 * Replacement for the mysqli::get_result method
 * for when mysqlnd is not available
 */
function get_result( $Statement ) {
	$RESULT = array();
	$Statement->store_result();
	for ( $i = 0; $i < $Statement->num_rows; $i++ ) {
		$Metadata = $Statement->result_metadata();
		$PARAMS = array();
		while ( $Field = $Metadata->fetch_field() ) {
			$PARAMS[] = &$RESULT[ $i ][ $Field->name ];
		}
		call_user_func_array( array( $Statement, 'bind_result' ), $PARAMS );
		$Statement->fetch();
	}
	return $RESULT;
}