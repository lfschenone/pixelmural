Pixel by Pixel
==============
An infinite canvas for collaborative pixel art.

Bugs
----
* The mouse position is off by two pixels. There is a bugfix in place, but it's ugly.
* Somehow fix the data types sent via ajax.
* The spectrum source throws a warning, see the console.

Tasks
-----
* 404, error handling
* Doesn't work on mobiles
* Improve Facebook sharing
* Block the bucket until the user shares
* Set up payments
* Break pixel-by-pixel.js into many files?
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

Code conventions
----------------
* Objects and classes go Capitalised
* CSS ids and classes go-with-dashes