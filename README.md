Pixel by Pixel
==============
An infinite canvas of collaborative pixel art

Bugs
----
* The mouse position is off by two pixels. There is a bugfix in place, but it's ugly.
* Somehow fix the data types sent via ajax.
* The spectrum source throws a warning, see the console.
* Sometimes the bucket doesn't paint all the pixels it should. The bug probably comes from the SQL statement.

Tasks
-----
* Preview
* 404, error handling
* Mobile version
* Cookies to remember things like the grid and colors
* Perfect Facebook sharing
* Block the bucket until the user shares
* Set up payments
* Break pixel-by-pixel.js into many files?
* Replace GET for POST ajax requests where adequate
* Draft pencil?
* When zooming and moving, only load the pixels that change
* Further optimise data transfer
* Further customise Spectrum

Further tasks
-------------
* i18n and l10n
* Documentation

Code conventions
----------------
* Objects and classes go Capitalised
* CSS ids and classes go-with-dashes