Pixel by Pixel
==============
An infinite canvas for collaborative pixel art.

Bugs
----
* The mouse position is off by two pixels. There is a bugfix in place in the CSS, but it prevents from using custom cursors accurately.
* The null values sent via ajax are not received as real nulls, but as some pseudo falsy.

Tasks
-----
* Set up payments
* When hovering over a pixel, highlight it
* Replace GET for POST ajax requests where necessary
* Preview?
* Draft pencil?
* Further optimise pixel loading when zooming and moving
  - Only load the new pixels
  - Minimise the data transfer (remove the # from hex code and use shorthand hex)
* Understand and optimize Spectrum

Further tasks
-------------
* Documentation
* i18n and l10n