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
		res.render('login', { message: req.flash('message') });
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
		res.render('managerpanel', { user: req.user, title: "Your managing panel" });
	});

	/* GET Create Event */
	router.get('/createliveevent', isAuthenticated, function(req, res){
		res.render('createliveevent', { title: 'Create a live event' });
	});

	/* POST for creating event */
	router.post('/createevent',isAuthenticated,function(req,res){
		var db = req.db;
		var collection = db.get('liveevents');
		var newevent = {	"sport": req.body.sport.toLowerCase(),
							"event_name": req.body.event_name,
							"team_home": req.body.team_home,
							"team_away": req.body.team_away,
						}
		switch(req.body.sport.toLowerCase()){
			case 'football':
				newevent.game_length = req.body.game_length*60000;
				newevent.team_home_score = 0;
				newevent.team_away_score = 0;
				break;
			case 'volleyball':
				console.log(req.body);
				newevent.sets = [];
				newevent.sets[0] = {};
				newevent.sets[0].team_home_points = 0;
				newevent.sets[0].team_away_points = 0;
				newevent.sets_win = parseInt(req.body.sets_win);
				newevent.sets_pts = parseInt(req.body.sets_pts);
				newevent.sets_tie_pts = parseInt(req.body.sets_tie_pts);
				newevent.current_set = 1;
				newevent.current_set_type = "normal";
				newevent.team_home_wins = 0;
				newevent.team_away_wins = 0;
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
	/*GET list liveevents and link either to remote or delete the event*/
	router.get('/liveevents/:id',isAuthenticated,function(req, res, next){
		var title;
		if(req.params.id ==='remote') title = "Choose event remote";
		if(req.params.id === 'delete') title = "Delete event";
		res.render('manageliveevents',{title: title, action: req.params.id});
	});
	/*GET manager site */
	router.get('/remote/:id', isAuthenticated, function(req, res, next) {
	  res.render('remote', { title: 'Your remote' });
	});

	/* Delete existing live events */
	router.get('/deleteliveevent/:id',isAuthenticated,function(req,res){
		var db = req.db;
		var collection = db.get('liveevents');
		collection.remove({'room':req.params.id},function(err,result){
			if(err) console.log('ERR: Deleting live event: '+err);
			console.log(result);
			res.redirect('/live');
		})
	});
	/* List past events for deletion */
	router.get('/pastevents/delete',isAuthenticated,function(req, res){
		res.render('manage-pastevents');
	});
	/* Delete past events */
	router.get('/pastevents/delete/:id',isAuthenticated,function(req,res){
		var db = req.db;
		var collection = db.get('pastevents');
		collection.remove({'_id':req.params.id},function(err,result){
			if(err) console.log('ERR: Deleting past event: '+err);
			console.log(result);
			res.redirect('/pastevents');
		})
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
