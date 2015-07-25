<?php

/**
 * Facebook Realtime Updates
 */

class Updates extends Controller {

	static function get() {
	    $hub_mode = GET( 'hub_mode' );
	    $hub_challenge = GET( 'hub_challenge' );
	    $hub_verify_token = GET( 'hub_verify_token' );

	    return $hub_challenge;
	}

	static function post() {
		// TO DO
	}

	static function put() {
		// TO DO
	}

	static function delete() {
		// TO DO
	}
}