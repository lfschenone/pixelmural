<?php

include 'includes/config.php';
include 'includes/functions.php';

$centerX = GET( 'centerX', DEFAULT_CENTERX );
$centerY = GET( 'centerY', DEFAULT_CENTERY );
$pixelSize = GET( 'pixelSize', DEFAULT_PIXELSIZE );

$ogUrl = BASE . $centerX . '/' . $centerY . '/' . $pixelSize;
$ogImage = BASE . "areas?centerX=$centerX&centerY=$centerY&width=1200&height=630&pixelSize=$pixelSize&format=png";

?><!DOCTYPE HTML>
<html>
<head>
	<title><?php echo TITLE; ?></title>
	<base href="<?php echo BASE; ?>">
	<link rel="icon" href="images/favicon.ico">
	<link rel="stylesheet" href="css/desktop.css">
	<link rel="stylesheet" href="css/spectrum.css">
	<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
	<script src="js/spectrum.js"></script>
	<script src="//connect.facebook.net/en_US/sdk.js"></script>
	<script src="js/functions.js"></script>
	<script src="js/pixelbypixel.js"></script>
	<script src="js/facebook.js"></script>
	<meta charset="UTF-8">
	<meta name="description" content="<?php echo DESCRIPTION; ?>">
	<meta property="og:url" content="<?php echo $ogUrl; ?>">
	<meta property="og:title" content="<?php echo TITLE; ?>">
	<meta property="og:description" content="<?php echo DESCRIPTION; ?>">
	<meta property="og:image" content="<?php echo $ogImage; ?>">
	<meta property="og:image:type" content="image/png">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
</head>
<body>
	<div id="fb-root"></div>

	<div id="popup-wrapper">
		<div id="popup">
			<h1>Welcome to Pixel by Pixel!</h1>
			<p>Pixel by Pixel is an infinite canvas of collaborative pixel art. The software prevents you or anyone from overwriting pixels made by other users, so your work is always protected from vandalism.</p>
			<img src="images/play.png">
		</div>
	</div>

	<div id="header">

		<div id="facebook-menu" class="menu">
			<button id="facebook-share-button" title="Share on Facebook"><img src="images/facebook-share.png" alt="Share"></button>
			<button id="facebook-login-button" title="Log in with Facebook"><img src="images/facebook-login.png" alt="Login"></button>
			<button id="facebook-logout-button" title="Log out from Facebook"><img src="images/facebook-logout.png" alt="Logout"></button>
		</div>

		<div id="tools-menu" class="menu">
			<button id="move-button" title="Move [Spacebar]"><img src="images/move.png" alt="Move"></button>
			<button id="grid-button" title="Grid [G]"><img src="images/grid.png" alt="Grid"></button>
			<button id="preview-button" title="Preview"><img src="images/preview.png" alt="Preview"></button>
			<button id="zoom-in-button" title="Zoom in [I]"><img src="images/zoom-in.png" alt="Zoom in"></button>
			<button id="zoom-out-button" title="Zoom out [O]"><img src="images/zoom-out.png" alt="Zoom out"></button>
			<button id="undo-button" title="Undo [Z]"><img src="images/undo.png" alt="Undo"></button>
			<button id="redo-button" title="Redo [X]"><img src="images/redo.png" alt="Redo"></button>
			<button id="author-button" title="Author"><img src="images/author.png" alt="Author"></button>
			<button id="dropper-button" title="Dropper [Alt]"><img src="images/dropper.png" alt="Dropper"></button>
			<button id="pencil-button" title="Pencil [P]"><img src="images/pencil.png" alt="Pencil"></button>
			<button id="brush-button" title="Brush"><img src="images/brush.png" alt="Brush"></button>
			<button id="eraser-button" title="Eraser [E]"><img src="images/eraser.png" alt="Eraser"></button>
			<button id="bucket-button" title="Bucket [B]"><img src="images/bucket.png" alt="Bucket"></button>
			<div id="colors-menu">
				<input class="color-input" type="color" value="#000000">
				<input class="color-input" type="color" value="#0000ff">
				<input class="color-input" type="color" value="#00ff00">
				<input class="color-input" type="color" value="#00ffff">
				<input class="color-input" type="color" value="#ff0000">
				<input class="color-input" type="color" value="#ff00ff">
				<input class="color-input" type="color" value="#ffff00">
				<input class="color-input" type="color" value="#ffffff">
			</div>
		</div>
	</div>

	<div id="alert"></div>

	<canvas id="mural"></canvas>
	<canvas id="grid"></canvas>
	<canvas id="preview"></canvas>

</body>
</html>