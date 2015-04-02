Pixel by Pixel
==============
An infinite canvas of collaborative pixel art

Bugs
----
* The mouse position is off by two pixels. There is a bugfix in place, but it's ugly.
* Somehow fix the data types sent via ajax.
* The spectrum source throws a warning, see the console.
* The bucket doesn't paint all the pixels it should, sometimes. The bug probably comes from the SQL statement that uses 'time' as a variable (controllers/Ajax.php, line 115).

Tasks
-----
* Make it so that the coordinates in the URL are in the center instead of the top left corner
* Transmit pixel data in base64
* Preview
* 404, error handling
* Doesn't work on mobiles
* Perfect Facebook sharing
* Block the bucket until the user shares
* Set up payments
* Break pixel-by-pixel.js into many files?
* When hovering over a pixel, highlight it?
* Replace GET for POST ajax requests where necessary
* Draft pencil?
* When zooming and moving, only load the pixels that change
* Further customise Spectrum

Further tasks
-------------
* i18n and l10n
* Documentation

Code conventions
----------------
* Objects and classes go Capitalised
* CSS ids and classes go-with-dashes