Pixel Mural
===========
An infinite canvas of collaborative pixel art

Bugs
----
* Spectrum bug: when selecting a color, if you click the pencil or the mural directly after, the color isn't updated.
This is contrary to the documented behaviour, and may be related to https://github.com/bgrins/spectrum/issues/301
* When painting too many pixels, the bucket erases instead of painting! There is a bugfix in place that simply limits
the amount of pixels that the bucket can paint.
* The null value is transmitted to the server as an empty string.
* Facebook names with special characters have encoding issues.
* Minor displacement when moving in the mobile version
* Minor displacement when zooming

Tasks
-----
* Replace Facebook link with custom link?
* Zoom with pinch
* Only load new pixels
* Only exchange with server on mouse up

Tasks if and when there is enough traffic
-----------------------------------------
* SVG icons
* Screenshot button?
* WebSockets?
* Migrate to node.js?
* Live updating
* API documentation
* Stateless API: send the token with every request?
* Steam version, contact Daniel Steer