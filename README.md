Pixel Mural
===========
An infinite canvas of collaborative pixel art

Bugs
----
* Sometimes the bucket doesn't paint all the pixels it should. Not sure how to reproduce it. The bug probably comes from the SQL statement.
* When repainting a pixel by clicking on its exact border, the pencil doesn't erase it, instead it updates it to the same color
* Spectrum bug: when selecting a color, if you click the brush or the mural directly after, the color isn't updated.
This is contrary to the documented behaviour, and may be related to https://github.com/bgrins/spectrum/issues/301
* When selecting a tool like the pencil, and pressing the spacebar, the tool switches to move but then returns!

Tasks
-----
* Switch to Facebook Anonymous Login
* Move with the arrows
* Zoom with the wheel
* Zoom locally before loading from the server

Tasks if and when there is enough traffic
-----------------------------------------
* Optimise loading
* Migrate to node.js?
* API documentation?
* Mobile version
* Steam version, contact Daniel Steer