# UISG-Scoreboard
A digital scoreboard for high school use.

*Work is still in progress*

Work on:
========
* Dynamic homepage based on existing live events
* Design
* Incorporating basketball, 
* Individual past event site
* Credits site
* Add times/dates

What should work:
================
* View live/past events in real-time
* Login-secured admin section
* Create/delete live events
* Remote control live events
* Delete past events
* Create an account

Installation
============
Requisites: Node.js, npm & MongoDB installed
After cloning the project from Github, in the directory.
```
npm install
```
To setup the database locally create a directory `data` and start your mongo daemon through `mongod --dbpath ./data/`.
Optionally you can use a external database. By default I'm using my external DB at mLab. *Yes, not smart to share a password*
Don't forget to take a look at `app.js` and change the link to the database `var db = monk('some link');` optionally.

Also the creation of a new user is protected by default, for which reason at the first time you can should take out authentication for that site, to create a user to the database using the form.
Just temporarilyremove `isAuthenticated` in `routes/manager.js` for the `router.get('signup',...)` part.

Currently Working on:
==================================================
* Add Basketball functionality
* Organize events differently: organize into tournaments and different sports


Notes:
=======
!!! Using locally stored frameworks (bootstrap, jquery)! change this for production environment!
