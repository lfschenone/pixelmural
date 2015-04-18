<?php

session_start();

include 'includes/config.php';
include 'includes/functions.php';

$centerX = GET( 'centerX', DEFAULT_CENTERX );
$centerY = GET( 'centerY', DEFAULT_CENTERY );
$pixelSize = GET( 'pixelSize', DEFAULT_PIXELSIZE );

?><!DOCTYPE HTML>
<html>
<head>
	<title><?php echo TITLE; ?></title>
	<base href="<?php echo BASE; ?>" />
	<link rel="icon" href="images/favicon.ico" />
	<link rel="stylesheet" href="css/desktop.css" />
	<link rel="stylesheet" href="css/spectrum.css" />
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.6.1/spectrum.min.js"></script>
	<script src="https://connect.facebook.net/en_US/sdk.js"></script>
	<script src="js/functions.js"></script>
	<script src="js/pixel-by-pixel.js"></script>
	<script src="js/facebook.js"></script>
	<meta name="description" content="<?php echo DESCRIPTION; ?>" />
	<meta property="og:url" content="<?php echo BASE . $centerX . '/' . $centerY . '/' . $pixelSize; ?>" />
	<meta property="og:title" content="<?php echo TITLE; ?>" />
	<meta property="og:description" content="<?php echo DESCRIPTION; ?>" />
	<meta property="og:image" content="<?php echo BASE . 'previews/' . $centerX . '/' . $centerY . '/' . $pixelSize; ?>.png" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
</head>
<body>
	<div id="fb-root"></div>

	<div id="tools-menu" class="menu">
		<button id="move-button" title="Move"><img src="images/move.png" alt="Move" /></button>
		<button id="zoom-in-button" title="Zoom in"><img src="images/zoom-in.png" alt="Zoom in" /></button>
		<button id="zoom-out-button" title="Zoom out"><img src="images/zoom-out.png" alt="Zoom out" /></button>
		<button id="undo-button" title="Undo"><img src="images/undo.png" alt="Undo" /></button>
		<button id="redo-button" title="Redo"><img src="images/redo.png" alt="Redo" /></button>
		<button id="dropper-button" title="Dropper"><img src="images/dropper.png" alt="Dropper" /></button>
		<button id="pencil-button" title="Pencil"><img src="images/pencil.png" alt="Pencil" /></button>
		<button id="brush-button" title="Brush"><img src="images/brush.png" alt="Brush" /></button>
		<button id="eraser-button" title="Eraser"><img src="images/eraser.png" alt="Eraser" /></button>
		<button id="bucket-button" title="Bucket"><img src="images/bucket.png" alt="Bucket" /></button>
		<button id="grid-button" title="Grid"><img src="images/grid.png" alt="Grid" /></button>
	</div>

	<div id="colors-menu" class="menu">
		<input class="color-input" type="text" value="#000000" />
		<input class="color-input" type="text" value="#0000ff" />
		<input class="color-input" type="text" value="#00ff00" />
		<input class="color-input" type="text" value="#00ffff" />
		<input class="color-input" type="text" value="#ff0000" />
		<input class="color-input" type="text" value="#ff00ff" />
		<input class="color-input" type="text" value="#ffff00" />
		<input class="color-input" type="text" value="#ffffff" />
	</div>

	<div id="facebook-menu" class="menu">
		<button id="facebook-share-button" title="Share on Facebook"><img src="images/facebook-share.png" alt="Share"></button>
		<button id="facebook-login-button" title="Log in with Facebook"><img src="images/facebook-login.png" alt="Login"></button>
		<button id="facebook-logout-button" title="Log out from Facebook"><img src="images/facebook-logout.png" alt="Logout"></button>
	</div>

	<div id="alert"></div>

	<canvas id="board"></canvas>
	<canvas id="grid"></canvas>

</body>
</html>