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
	// retrieving initial game information from DB
	var collection = db.get('liveevents');
	collection.find({'room': room}, {}, function(e, docs){
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
		io.on('connection', function(socket){
			socket.on(room, function(){
				socket.room = room;
				socket.join(room);
				console.log('LOG: A user connected to '+room+'.');
				//keep track of VIEWERS
				VIEWERS++;
				io.to(room).emit('update viewer count',VIEWERS);

				//provide initial game information to viewer
				socket.emit('initial game state', GAME);

				//keep track of VIEWERS on disconnect
				socket.on('disconnect',function(){
					VIEWERS--;
					io.to(room).emit('update viewer count',VIEWERS);
				});
				socket.on('message', function(message){
					console.log(message);
				})
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
			if (newScoreInfo.team === GAME.team_home) {
				GAME.team_home_score = newScoreInfo.score;
			} else {
				GAME.team_away_score = newScoreInfo.score;
			}
			io.to(room).emit('update score signal', newScoreInfo);
		});
	}
	function volleyball(socket){
		socket.on('volleyball point', function(pointInfo){
			var home_points = GAME.sets[GAME.currentSet].team_home_points;
			var away_points = GAME.sets[GAME.currentSet].team_away_points;
			if(pointInfo.team === GAME.team_home){
				if(currentSet){

				}
				home_points = pointInfo.points;
			} else {
				away_points = pointInfo.points;
			}
		})
	}

	/**
	 **************************************Function to start the game clock (countup) **********************************
	 */
	function startClock () {
		if (CURRENT_TIME_UP != GAME.game_length) {
			ISTIMERUNNING = true;
			io.to(room).emit('current time status', 'start');
			clockInterval = setInterval(function () {
				CURRENT_TIME_UP += 1000;
				updateClock();
			}, 1000);
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
		io.to(room).emit('current time print', printTime);
	}

	function saveGame() {
		collection.remove({'room':room},{},function(err) {
        	if(err) console.log("Error removing live event: "+err);
    	});
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