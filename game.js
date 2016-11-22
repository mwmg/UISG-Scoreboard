function Game (io, db, room) {
	console.log('LOG: A socket for room ' + room + ' has been started.');
	//==================
	// Game variables
	//==================
	var GAME;
	var CURRENT_TIME_UP = 0;
	//var TIME_CUTOFF = 59999; // ms (59.99 seconds)
	var ISTIMERUNNING = false;
	var VIEWERS = 0;
	var COMMENTS = [];
	// retrieving initial game information from DB
	var collection = db.get('liveevents');
	collection.find({'room': room}, {}, function (e, docs){
		if(e){
			console.log(e);
		}else if(docs.length === 1){
			GAME = docs[0];
			commonSocketStuff();
		}else{
			console.log('ERROR: event with invalid room number has been started.');
		}
	});
	//Functions
	/*
		Socket.io stuff
	*/
	function commonSocketStuff(){
		io.on('connection', function (socket){
			socket.on(room, function(){
				socket.room = room;
				socket.join(room);
				console.log('LOG: A user connected to '+room+'.');
				//keep track of VIEWERS
				VIEWERS++;
				io.to(room).emit('update viewer count',VIEWERS);

				//provide initial game information to viewer
				socket.emit('initial game state', GAME);
				socket.emit('initial comments', COMMENTS);

				//keep track of VIEWERS on disconnect
				socket.on('disconnect',function(){
					VIEWERS--;
					io.to(room).emit('update viewer count',VIEWERS);
				});
				socket.on('message', function (message){
					console.log(message);
				})
				socket.on('comment-msg', function (data){
					COMMENTS.push(data);
					//Send message to everyone
					io.to(room).emit('comment-new-msg', data);
				});
				socket.on('save game', function(){
					saveGame();
				});
				//start sport specific event handlers
				switch(GAME.sport.toLowerCase()){
					case 'football':
						football(socket);
						break;
					case 'volleyball':
						volleyball(socket);
						break;
					default:
						console.log('ERROR: Event from database contains invalid sport type.');
				}
			});
		});
	}
	/*
	**************************************Different sport types****************************************
	*/
	function football(socket){
		updateClock();
		socket.on('inside message', function(message){
			console.log(message);
		})
		// socket to recieve 'pause' signal from the remote
		socket.on('pause time', function () {
			stopClock();
			io.to(room).emit('current time status', 'pause');
		});

		// socket to recieve 'start' signal from the remote
		socket.on('start time', function () {
			console.log("Received signal");
			if (!ISTIMERUNNING) startClock();
			io.to(room).emit('current time status', 'start');
		});

		// socket to reset the clock
		socket.on('reset clock', function () {
			stopClock();
			CURRENT_TIME_UP = 0;
			updateClock();
		});

		// socket to receive signal to change score from the remote
		socket.on('update score', function (newScoreInfo) {
			if (newScoreInfo.team === 'home') {
				GAME.team_home_score = newScoreInfo.score;
			} else {
				GAME.team_away_score = newScoreInfo.score;
			}
			io.to(room).emit('update score signal', newScoreInfo);
		});
	}
	function volleyball(socket){
		socket.on('volleyball update points', function (newPointsInfo){
			if(newPointsInfo.team === 'home'){
				GAME.sets[GAME.current_set-1].team_home_points = newPointsInfo.points;
			} else{
				GAME.sets[GAME.current_set-1].team_away_points = newPointsInfo.points;
			}
			io.to(room).emit('volleyball update points signal', newPointsInfo);
		})
		socket.on('volleyball update set', function (updateGame){
			//updates the whole GAME object received from remote.js
			GAME = updateGame;
			io.to(room).emit('volleyball update set signal', updateGame);
		});
		socket.on('volleyball win', function (team){
			if(team === 'home'){
				GAME.winner = GAME.team_home;
			} else{
				GAME.winner = GAME.team_away;
			}
			io.to(room).emit('volleyball win signal', team);
		});
	}

	/**
	 **************************************Function to start the game clock (countup) **********************************
	 */
	function startClock () {
		if (CURRENT_TIME_UP != GAME.game_length) {
			ISTIMERUNNING = true;
			io.to(room).emit('current time status', 'start');
			clockInterval = setInterval(function () {
				CURRENT_TIME_UP += 10;
				if((CURRENT_TIME_UP % 1000) === 0) updateClock();
			}, 10);
			console.log("Started clock");
		} else {
			io.to(room).emit('current time status', 'pause');
		}
	}

	/**
	 * Function to stop the game clock
	 */
	function stopClock () {
		ISTIMERUNNING = false;
		clearInterval(clockInterval);
		io.to(room).emit('current time status', 'pause');
	}
	/**
	 * Function to get the hours, minutes, seconds and milliseconds
	 * from a time in ms originally
	 * @param  {Number} s Time in milliseconds
	 * @return {Array}    Formatted time as [h, m, s, ms]
	 */
	function msToTime (s) {
		/**
		 * Internal function to append 0's to
		 * numbers < 10 to make them look pretty
		 * @param {Number} n Number which is to be prettified
		 */
		function addZ (n) {
			return (n < 10? '0' : '') + n;
		}
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;
		return [addZ(hrs), addZ(mins), addZ(secs), addZ(ms)];
	}
	/**
	 * Function to update the clock
	 */
	 // ONLY WORKS FOR UPCOUNTING clock
	function updateClock () {
		var printTime;
		if (CURRENT_TIME_UP >= GAME.game_length) {
			clearInterval(clockInterval);
			stopClock();
			io.to(room).emit('current time status', 'game finished');
		}
		var formattedTime = msToTime(CURRENT_TIME_UP);
		printTime = formattedTime[1] + ':' + formattedTime[2];
		console.log(printTime);
		if(ISTIMERUNNING){
			io.to(room).emit('current time status', 'Clock Running');
		}else{
			io.to(room).emit('current time status', 'Clock Stopped');
		}
		io.to(room).emit('current time print', printTime);
	}

	function saveGame() {
		collection.remove({'room':room},{},function(err) {
        	if(err) console.log("Error removing live event: "+err);
    	});
    	var d = new Date();
    	var dateString = d.getFullYear().toString()+'-'+(d.getMonth()+1).toString()+'-'+d.getDate().toString();
    	GAME.event_date = dateString;
		console.log(GAME);
		collection = db.get('pastevents');
		collection.insert(GAME,function(err,result){ // SOMETHINGS WRONG WITH GAME
			if (err){
			    console.log('Error in storing live event: '+err);  
			    //throw err;  
			    //ERROR HANDLING HERE!
			}
			console.log('Live event stored to pastevents: '+GAME);
		});
	}
}
module.exports = Game;