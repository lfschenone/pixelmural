Pixel Mural
===========
An infinite canvas of collaborative pixel art

Bugs
----
* Sometimes the bucket doesn't paint all the pixels it should. Not sure how to reproduce it. The bug probably comes from the SQL statement.
* When repainting a pixel by clicking on its exact border, the pencil doesn't erase it, instead it updates it to the same color
* When two users are connected from the same ip, the global user of the second doesn't initialise correctly, and his pixels are not saved.

Tasks
-----
* Delete cookie when loggin out
* Hotkey for the brush?
* In the API, always check if the global user exists
* 404s, error handling
* Mobile version
* Set up payments
* Optimise preview loading and loading in general
* Further customise Spectrum

Further tasks
-------------
* Migrate to node.js?
* Improve the REST API
* i18n and l10n
* API documentation?