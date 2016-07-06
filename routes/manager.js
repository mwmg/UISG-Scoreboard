var express = require('express');
var router = express.Router();
//Include code for running server-side socket.io
//Handles live events
var game = require('../game.js');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/manager/login');
}

module.exports = function(passport){
	router.get('/',isAuthenticated, function(req,res){
		res.redirect('/manager/panel');
	});
	/* GET login page. */
	router.get('/login', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('login', { title: 'Your managing panel', message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/manager/panel',
		failureRedirect: '/manager/login',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup',isAuthenticated, function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/manager/panel',
		failureRedirect: '/manager/signup',
		failureFlash : true  
	}));

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	//********
	// My stuff
	//*********

	/* GET Home Page */
	router.get('/panel', isAuthenticated, function(req, res){
		res.render('managerpanel', { user: req.user });
	});

	/* GET Create Event */
	router.get('/createliveevent', isAuthenticated, function(req, res){
		res.render('createliveevent', { title: 'Create a live event' });
	});

	/* POST for creating event */
	router.post('/createevent',isAuthenticated,function(req,res){
		var db = req.db;
		var collection = db.get('liveevents');
		var newevent = {	"sport": req.body.sport,
							"event_name": req.body.event_name,
							"team_home": req.body.team_home,
							"team_away": req.body.team_away,
							"game_length": req.body.game_length*60000,
						}
		switch(req.body.sport){
			case 'Football':
				newevent.start_time = 0;
				newevent.team_home_score = 0;
				newevent.team_away_score = 0;
				newevent.TIME_LIMIT = newevent.game_length;
				break;
			case 'default':
				console.log('Invalid sport entered through form');
				break;
		}
		newevent.room = (Math.floor(Math.random()*90000) + 10000).toString();
		collection.insert(newevent, function(err,result){
			if (err){
			    console.log('Error in creating event: '+err);  
			    throw err;  
			}
			console.log('Event created: '+newevent);
			res.redirect("/manager/startevent/"+newevent.room);
		});
	});

	/*GET manager site */
	router.get('/remote/:id', isAuthenticated, function(req, res, next) {
	  res.render('remote', { title: 'Your remote' });
	});

	/*GET this starts a socket for a given event */
	router.get('/startevent/:id', isAuthenticated, function(req, res) {
		var db = req.db;
		var io = req.io;
		var room = req.params.id;
		game(io,db,room);
		res.redirect('/live');
	});
	return router;
}
