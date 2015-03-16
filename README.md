Pixel by Pixel
==============
An infinite canvas for collaborative pixel art.

Bugs
----
* The mouse position is off by two pixels. There is a bugfix in place in the CSS, but it prevents from using custom cursors accurately.
* The null values sent via ajax are not received as real nulls, but as some pseudo falsy.
* At some point jQuery is receiving '!' when expecting a #rrggbb hex code. See the console.
* Links to coordinates don't work

Tasks
-----
* Block bucket until share
* Set up payments
* Bucket undo functionality
* When hovering over a pixel, highlight it
* Replace GET for POST ajax requests where necessary
* Preview?
* Draft pencil?
* Further optimise pixel loading when zooming and moving
  - Only load the pixels that change
  - Minimise data transfer by removing the # from the hex codes and using shorthand hex
* Further customise Spectrum

Further tasks
-------------
* Documentation
* i18n and l10n