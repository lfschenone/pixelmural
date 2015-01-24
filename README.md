Pixel by Pixel
==============
An infinite canvas for collaborative pixel art.

Bugs
----
* The mouse position is off by two pixels. There is a bugfix in place in the CSS, but it prevents from using custom cursors accurately.
* The null values sent via ajax are not received as real nulls, but as some pseudo falsy.

Tasks
-----
* Tooltips:
   * Alerts as tooltips next to the pixel
   * Never go off screen
   * Info tool should display more info
   * Tooltip for spectrum
* When hovering over a pixel, highlight it
* Replace GET for POST ajax requests where necessary
* Preview?
* Draft pencil?
* Optimize pixel loading when zooming and moving
* Understand and optimize the spectrum

Further tasks
-------------
* Documentation
* i18n and l10n