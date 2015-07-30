<?php

class FacebookPayments {

    static function POST() {

		$token = SESSION( 'token' );
		$User = User::newFromToken( $token );
		if ( !$User ) {
			return 401; // Not authorised
		}

        $payment_id = POST( 'payment_id' );
        $quantity = POST( 'quantity' );
        $status = POST( 'status' );
        $signed_request = POST( 'signed_request' );

        if ( $status === 'completed' ) {
            $User->brush = 1;
            $User->update();
        }
        echo $status;
    }
}