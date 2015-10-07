<?php

class FacebookRealtimeUpdates extends Controller {

	static function GET() {

	    $hub_mode = GET( 'hub_mode' );
	    $hub_challenge = GET( 'hub_challenge' );
	    $hub_verify_token = GET( 'hub_verify_token' );

	    echo $hub_challenge;
	}
}