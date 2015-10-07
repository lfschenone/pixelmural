<?php

class FacebookRealtimeUpdates extends Controller {

	static function GET() {

	    $hub_mode = GET( 'hub.mode' );
	    $hub_challenge = GET( 'hub.challenge' );

	    echo $hub_challenge;
	}
}