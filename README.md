Pixel Mural
===========
An infinite canvas of collaborative pixel art

Bugs
----
* When repainting a pixel by clicking on its exact border, the pencil doesn't erase it, instead it updates it to the same color.
* Spectrum bug: when selecting a color, if you click the pencil or the mural directly after, the color isn't updated.
This is contrary to the documented behaviour, and may be related to https://github.com/bgrins/spectrum/issues/301
* When selecting a tool like the pencil, and pressing the spacebar, the tool switches to move but then returns.

Tasks
-----
* Mobile version
* The bucket completely fails when painting a lot
* Zoom with the wheel
* Zoom locally before loading from the server

Tasks if and when there is enough traffic
-----------------------------------------
* Fix the encoding issue with Facebook names
* Accesskeys?
* Download button?
* Custom SVG icons
* Only load new pixels
* Use WebSockets
* Live updating
* Migrate to node.js?
* API documentation?
* Steam version, contact Daniel Steer
* Rotate?
* Stateless API