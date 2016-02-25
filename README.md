Pixel Mural
===========
An infinite canvas of collaborative pixel art

Bugs
----
* Spectrum bug: when selecting a color, if you click the pencil or the mural directly after, the color isn't updated. This is contrary to the documented behaviour, and may be related to https://github.com/bgrins/spectrum/issues/301
* When painting too many pixels, the bucket erases instead of painting! The current solution is limiting the amount of pixels that the bucket can paint.
* The null value is transmitted to the server as an empty string. The current solution is avoiding strict comparisons, see controllers/Areas.php
* Facebook names with special characters don't display well (encoding problem).

Tasks
-----
* Zoom with pinch
* Title attribute for the stroke/color buttons

Tasks if and when there is enough traffic
-----------------------------------------
* Only load new pixels
* SVG icons
* Screenshot button?
* WebSockets?
* Live updating
* Migrate to node.js?
* API documentation
* Stateless API: send the token with every request?
* Steam version, contact Daniel Steer