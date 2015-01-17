<!DOCTYPE HTML>
<html>
<head>
<title>Pixel by Pixel</title>
<base href="<?php echo BASE; ?>" />
<link rel="icon" href="favicon.ico" />
<link rel="stylesheet" href="css/style.css" />
<link rel="stylesheet" href="css/spectrum.css" />
<script src="js/jquery.js"></script>
<script src="js/functions.js"></script>
<script src="js/prototypes.js"></script>
<script src="js/spectrum.js"></script>
<script src="js/pbp.js"></script>
<script>user.ip = '<?php echo $_SERVER['REMOTE_ADDR']; ?>';</script>
<meta name="description" content="An infinite canvas for collaborative pixel art. Come leave your mark!" />
<?php global $topLeftX, $topLeftY, $pixelSize; ?>
<meta property="og:url" content="<?php echo BASE . $topLeftX . '/' . $topLeftY . '/' . $pixelSize; ?>" />
<meta property="og:title" content="<?php echo TITLE; ?>" />
<meta property="og:description" content="An infinite canvas for collaborative pixel art. Come leave your mark!" />
<meta property="og:image" content="<?php echo BASE . 'screens/' . $topLeftX . ',' . $topLeftY . ',' . $pixelSize; ?>.png" />
<meta property="og:image:type" content="image/png" /> 
<meta property="og:image:width" content="1200" /> 
<meta property="og:image:height" content="800" />
</head>
<body>
<div id="fb-root"></div>
<script src="//connect.facebook.net/en_US/sdk.js"></script>
<script src="js/facebook.js"></script>