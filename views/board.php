<!DOCTYPE HTML>
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
	<meta property="og:url" content="<?php echo BASE . $topLeftX . '/' . $topLeftY . '/' . $pixelSize; ?>" />
	<meta property="og:title" content="<?php echo TITLE; ?>" />
	<meta property="og:description" content="<?php echo DESCRIPTION; ?>" />
	<meta property="og:image" content="<?php echo BASE . 'screens/' . $topLeftX . '/' . $topLeftY . '/' . $pixelSize; ?>.png" />
	<meta property="og:image:type" content="image/png" /> 
	<meta property="og:image:width" content="1180" /> 
	<meta property="og:image:height" content="600" /> 
</head>
<body>
	<div id="fb-root"></div>

	<div id="tools-menu" class="menu">
		<button id="move-button" title="Move [Spacebar]"><img src="images/move.png" alt="Move" /></button>
		<button id="zoom-in-button" title="Zoom in [I]"><img src="images/zoom-in.png" alt="Zoom in" /></button>
		<button id="zoom-out-button" title="Zoom out [O]"><img src="images/zoom-out.png" alt="Zoom out" /></button>
		<button id="undo-button" title="Undo [Z]"><img src="images/undo.png" alt="Undo" /></button>
		<button id="redo-button" title="Redo [X]"><img src="images/redo.png" alt="Redo" /></button>
		<button id="eyedrop-button" title="Eyedrop [ALT]"><img src="images/eyedrop.png" alt="Eyedrop" /></button>
		<button id="pencil-button" title="Pencil [P]"><img src="images/pencil.png" alt="Pencil" /></button>
		<button id="eraser-button" title="Eraser [E]"><img src="images/eraser.png" alt="Eraser" /></button>
		<button id="bucket-button" title="Bucket [B]"><img src="images/bucket.png" alt="Bucket" /></button>
		<button id="grid-button" title="Grid [G]"><img src="images/grid.png" alt="Grid" /></button>
		<input id="color-input" type="text" value="#000000" title="Color" />
	</div>

	<div id="facebook-menu" class="menu">
		<button id="facebook-share-button"><img src="images/facebook-share.png" alt="Share"></button>
		<button id="facebook-login-button"><img src="images/facebook-login.png" alt="Login"></button>
		<button id="facebook-logout-button"><img src="images/facebook-logout.png" alt="Logout"></button>
	</div>

	<div id="alert"></div>

	<canvas id="board"></canvas>
	<canvas id="grid"></canvas>

</body>
</html>