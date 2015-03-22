Pixel by Pixel
==============
An infinite canvas for collaborative pixel art.

Bugs
----
* The mouse position is off by two pixels. There is a bugfix in place in the CSS, but it prevents from using custom cursors accurately.
* Somehow fix the data types sent via ajax.
* At some point jQuery is receiving '!' when expecting a #rrggbb hex code. See the console.

Tasks
-----
* 404, error handling
* Doesn't work on mobiles
* Fix and perfect Facebook sharing
* Block the bucket until the user shares
* Set up payments
* What to do when sucking the color of the background?
* Get rid of prototypes.js, per bad practice?
* Break pbp.js into many files
* When hovering over a pixel, highlight it
* Replace GET for POST ajax requests where necessary
* Preview?
* Draft pencil?
* When zooming and moving, only load the pixels that change
* When loading pixels, minimise data transfer by removing the # from the hex codes and using shorthand hex
* Further customise Spectrum

Further tasks
-------------
* i18n and l10n
* Documentation