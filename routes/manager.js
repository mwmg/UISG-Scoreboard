var express = require('express');
var router = express.Router();
//Include code for running server-side socket.io
//Handles live events
var game = require('../game.js');
var STARTED = false;

/*GET manager site */
router.get('/', function(req, res, next) {
  res.render('manager', { title: 'Your managing panel' });
});

/*GET manager site */
router.get('/remote/:id', function(req, res, next) {
  res.render('remote', { title: 'Your remote' });
});

/*GET this starts a socket for a given event */
router.get('/startevent/:id',function(req, res) {
	var db = req.db;
	var io = req.io;
	var room = req.params.id;
	if (!STARTED) game(io,db,room);
	STARTED = true;
	res.send('Event socket started!');
});
module.exports = router;
