<?php

class FacebookRealtimeUpdates extends Controller {

	static function GET() {

	    $hub_mode = GET( 'hub_mode' );
	    $hub_challenge = GET( 'hub_challenge' );

	    echo $hub_challenge;
	}
}