function Game (io, db, room) {
	console.log('LOG: A socket for room ' + room + ' has been started.');

	// Game variables
	var GAME;
	var CURRENT_TIME_UP = 0;	//for football
	var CURRENT_TIME_DOWN;		// countdown for basketball

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

	// -- All other functions --
	
	// Socket.io stuff
	function commonSocketStuff(){
		io.on('connection', function (socket){
			socket.on(room, function(){
				//set current room
				socket.room = room;
				socket.join(room);

				//keep track of VIEWERS
				console.log('LOG: A user connected to '+room+'.');
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

				//Debugging event
				socket.on('message', function (message){
					console.log(message);
				})

				// Comment functonality
				socket.on('comment-msg', function (data){
					COMMENTS.push(data);
					//Send message to everyone
					io.to(room).emit('comment-new-msg', data);
				});

				//save game to DB - must be requested by remote
				socket.on('save game', function(){
					saveGame();
				});

				//start sport specific event handlers
				// The socket object needs to be passed on for this to work
				switch(GAME.sport.toLowerCase()){
					case 'football':
						football(socket);
						break;
					case 'volleyball':
						volleyball(socket);
						break;
					case 'basketball':
						basketball(socket);
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

		//debugging socket io
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
	function basketball (socket){
		updateCountdown();

		//pause countdown
		socket.on('pause countdown', function (){
			stopCountdown();
			io.to(room).emit('current countdown status', 'pause');
		});

		// start countdown
		socket.on('start countdown', function (){
			if(!ISTIMERUNNING) startCountdown();
			io.to(room).emit('current countdown status', 'start');
		});

		//reset countdown
		socket.on('reset countdown', function (){
			stopCountdown();
			CURRENT_TIME_DOWN = GAME.countdown_length;
			updateCountdown();
		});

		// change score based on remote signal
		// identical to football
		socket.on('update score', function (newScoreInfo) {
			if (newScoreInfo.team === 'home') {
				GAME.team_home_score = newScoreInfo.score;
			} else {
				GAME.team_away_score = newScoreInfo.score;
			}
			io.to(room).emit('update score signal', newScoreInfo);
		});

		// change foul based on remote signal
		socket.on('update foul', function (newFoulInfo) {
			if (newFoulInfo.team === 'home') {
				GAME.team_home_foul = newFoulInfo.foul;
			} else {
				GAME.team_away_foul = newFoulInfo.foul;
			}
			io.to(room).emit('update score signal', newFoulInfo);
		});
	}

	// Function to start upwards counting clock
	function startClock () {
		if (CURRENT_TIME_UP != GAME.game_length) {
			ISTIMERUNNING = true;
			io.to(room).emit('current time status', 'start');
			clockInterval = setInterval(function () {
				CURRENT_TIME_UP += 10;

				// only send time update to client every second
				if((CURRENT_TIME_UP % 1000) === 0) updateClock();
			}, 10);
			console.log("Started clock");
		} else {
			io.to(room).emit('current time status', 'pause');
		}
	}

	// Function to stop upwards counting clock
	function stopClock () {
		ISTIMERUNNING = false;
		clearInterval(clockInterval);
		io.to(room).emit('current time status', 'pause');
	}

	// Function to start countdown clock
	function startCountdown () {
		if(CURRENT_TIME_DOWN != 0){
			ISTIMERUNNING = true;
			io.to(room).emit('current countdown status', 'start');
			countdownInterval = setInterval(function () {
				CURRENT_TIME_DOWN -= 10;

				// Only send time update to clients every second
				if((CURRENT_TIME_DOWN % 1000) === 0) updateCountdown();
			}, 10);
			console.log('Started countdown')
		} else{
			io.to(room).emit('current countdown status', 'pause');
		}
	}

	// Function to stop countdown clock
	function stopCountdown () {
		ISTIMERUNNING = false;
		clearInterval(countdownInterval);
		io.to(room).emit('current countdown status', 'pause');
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

	// Function to send update of upwards counting clock to client
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

	// Function to send update of countdown timer to client
	function updateCountdown (){
		var printTime;
		if(CURRENT_TIME_DOWN <= 0){
			clearInterval(countdownInterval);
			stopCountdown();
			io.to(room).emit('current countdown status', 'game finished');
		}
		var formattedTime = msToTime(CURRENT_TIME_DOWN);
		printTime = formattedTime[1] + ':' + formattedTime[2];
		if(ISTIMERUNNING){
			io.to(room).emit('current countdown status', 'Timer Running');
		}else{
			io.to(room).emit('current countdown status', 'Timer Stopped');
		}
		io.to(room).emit('current countdown print', printTime);
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