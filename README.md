Pixel Mural
===========
An infinite canvas of collaborative pixel art

Bugs
----
* When repainting a pixel by clicking on its exact border, the pencil doesn't erase it, instead it updates it to the same color.
* Spectrum bug: when selecting a color, if you click the pencil or the mural directly after, the color isn't updated.
This is contrary to the documented behaviour, and may be related to https://github.com/bgrins/spectrum/issues/301
* When selecting a tool like the pencil, and pressing the spacebar, the tool switches to move but then returns.
* When painting too many pixels, the bucket erases instead of painting! There is a bugfix in place that simply limits
the amount of pixels that the bucket can paint.
* The null value is transmitted to the server as an empty string.

Tasks
-----
* Zoom locally before loading from the server
* Zoom with pinch
* Only load new pixels

Tasks if and when there is enough traffic
-----------------------------------------
* Encoding issue with Facebook names
* Tool to move drawings?
* Accesskeys?
* Download screenshot button?
* Custom SVG icons
* WebSockets?
* Live updating
* Migrate to node.js?
* API documentation?
* Steam version, contact Daniel Steer
* Stateless API