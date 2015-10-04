Pixel Mural
===========
An infinite canvas of collaborative pixel art

Bugs
----
* When repainting a pixel by clicking on its exact border, the pencil doesn't erase it, instead it updates it to the same color
* Spectrum bug: when selecting a color, if you click the brush or the mural directly after, the color isn't updated.
This is contrary to the documented behaviour, and may be related to https://github.com/bgrins/spectrum/issues/301
* When selecting a tool like the pencil, and pressing the spacebar, the tool switches to move but then returns.
It surely has to do with the functionality that by pressing the spacebar, the active button is pressed, and the move tool,
by being the first, is the active button by default.

Tasks
-----
* Mobile version
* Stateless API
* Fix the encoding issue with Facebook names
* Zoom with the wheel
* Zoom locally before loading from the server
* SVG icons?
* Accesskeys?

Tasks if and when there is enough traffic
-----------------------------------------
* Custom icons
* Only load new pixels
* Use WebSockets
* Live updating
* Migrate to node.js?
* API documentation?
* Steam version, contact Daniel Steer