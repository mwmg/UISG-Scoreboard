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
		res.send('Event socket started!');
	});
	return router;
}
