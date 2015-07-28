<?php

class Users extends Controller {

	static function get() {
		global $gUser;

		$Facebook = new Facebook\Facebook([
			'app_id' => FACEBOOK_APP_ID,
			'app_secret' => FACEBOOK_APP_SECRET,
			'default_graph_version' => 'v2.4',
		]);

		$Helper = $Facebook->getJavaScriptHelper();

		try {
			$accessToken = $Helper->getAccessToken();
			$Response = $Facebook->get( '/me?fields=id,name,email,link,locale,gender,timezone', $accessToken );
			$GraphUser = $Response->getGraphUser();
			$facebookId = $GraphUser->getId();
			$gUser = User::newFromFacebookId( $facebookId );

			// If no user matches the Facebook id, create one
			if ( !$gUser ) {
				$gUser = new User;
				$gUser->facebook_id = $facebookId;
				$gUser->status = 'user';
				$gUser->insert();
			}

			// No matter if the user is new or returning, update the data
			$gUser->name = $GraphUser->getName();
			$gUser->link = $GraphUser->getLink();
			$gUser->email = $GraphUser->getProperty( 'email' );
			$gUser->locale = $GraphUser->getProperty( 'locale' );
			$gUser->gender = $GraphUser->getProperty( 'gender' );
			$gUser->timezone = $GraphUser->getProperty( 'timezone' );

		} catch ( Exception $Exception ) {
			// Important! If anything goes wrong, make sure to create a user, or the pixels won't be saved

			$ip = $_SERVER['REMOTE_ADDR'];
			$gUser = User::newFromIp( $ip );

			if ( !$gUser ) {
				$gUser = new User;
				$gUser->name = $ip; // IPs are the names of anonymous users
				$gUser->status = 'anon';
				$gUser->insert();
			}
		}

		// Set the token
		$token = md5( uniqid() );
		$_SESSION['token'] = $token;
		setcookie( 'token', $token, $_SERVER['REQUEST_TIME'] + 60 * 60 * 24 * 30, '/' ); // 30 days
		$gUser->token = $token;
		$gUser->update();

		return $gUser;
	}
}