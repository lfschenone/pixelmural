<?php

class FacebookPayments {

    static function post() {
        global $gUser;

        $payment_id = POST( 'payment_id' );
        $quantity = POST( 'quantity' );
        $status = POST( 'status' );
        $signed_request = POST( 'signed_request' );

        if ( $status === 'completed' ) {
            $gUser->brush = 1;
            $gUser->update();
        }
        return $status;
    }
}