var socket = io();
var room = currentRoom();

var GAME;

/*
************************************** Main Functions ****************************************
*/

//extract the name of the socket.io room, based on the url
function currentRoom () {
    var pathArray = window.location.pathname.split( '/' );
    return pathArray[pathArray.length - 1];
}

function football() {
	$('#football').removeClass('hidden');
	football_init();

	// Button handler to send signal to server to pause time
	$('#start-timer').click(function () {
		socket.emit('start time', '');
	});

	// Button handler to send signal to server to start time
	$('#stop-timer').click(function () {
		socket.emit('pause time', '');
	});

	// Button handler to send signal to server to reset clock
	$('#resetclock').click(function () {
		socket.emit('reset clock', '');
	});

	//Receive timer update
	socket.on('current time print', function(printTime){
	    $('#mainclock').text(printTime);
	});

	//Receive timer status update
	socket.on('current time status', function(status){
		var status;
		console.log(status);
		if (status === 'start') {
			status = 'Clock Running';
		}
		if (status === 'pause') {
			status = 'Clock Stopped';
		}
		if (status === 'game finished') {
			status = 'Game finished';
			$('#saveGameModal').removeClass('hidden');
		}
		if(status) $('#timerstatus').text(status);
	});

	// Functions to give functionality to plus and minus buttons
	$('#teamhomeplus').click(function () {
		GAME.team_home_score++;
		football_init();
		changeScore('home', GAME.team_home_score);
	});

	$('#teamawayplus').click(function () {
		GAME.team_away_score++;
		football_init();
		changeScore('away', GAME.team_away_score);
	});

	$('#teamhomeminus').click(function () {
		if (GAME.team_home_score > 0) GAME.team_home_score--;
		football_init();
		changeScore('home', GAME.team_home_score);
	});

	$('#teamawayminus').click(function () {
		if (GAME.team_away_score > 0) GAME.team_away_score--;
		football_init();
		changeScore('away', GAME.team_away_score);
	});
}

function volleyball() {
	$('#volleyball').removeClass('hidden');
	volleyball_init();
	// Functions to give functionality to plus and minus buttons
	$('#volleyball_homeplus').click(function () {
		GAME.sets[GAME.current_set-1].team_home_points++;
		volleyballChangePoints('home', GAME.sets[GAME.current_set-1].team_home_points);
		//check if the set is won
		if((GAME.sets[GAME.current_set-1].team_home_points - GAME.sets[GAME.current_set-1].team_away_points) >=2 
			&& GAME.sets[GAME.current_set-1].team_home_points >= GAME.sets_pts) {
			console.log('update set for home');
			volleyballUpdateSet('home');
		}
		volleyball_init();
	});

	$('#volleyball_awayplus').click(function () {
		GAME.sets[GAME.current_set-1].team_away_points++;
		volleyballChangePoints('away', GAME.sets[GAME.current_set-1].team_away_points);
		//check if the set is won
		if((GAME.sets[GAME.current_set-1].team_away_points - GAME.sets[GAME.current_set-1].team_home_points) >=2 
			&& GAME.sets[GAME.current_set-1].team_away_points >= GAME.sets_pts) {
			console.log('update set for away');
			volleyballUpdateSet('away');
		}
		volleyball_init();
	});

	$('#volleyball_homeminus').click(function () {
		if (GAME.sets[GAME.current_set-1].team_home_points > 0) GAME.sets[GAME.current_set-1].team_home_points--;
		volleyball_init();
		volleyballChangePoints('home', GAME.sets[GAME.current_set-1].team_home_points);
	});

	$('#volleyball_awayminus').click(function () {
		if (GAME.sets[GAME.current_set-1].team_away_points > 0) GAME.sets[GAME.current_set-1].team_away_points--;
		volleyball_init();
		volleyballChangePoints('away', GAME.sets[GAME.current_set-1].team_away_points);
	});
	/*
	!!!!!!! Make sure that if a tie breaker is being played GAME.sets_pts changes EVERYWHERE to GAME.sets_tie_pts
	*/
}

function football_init () {
    $('#team_home_score').attr('value', GAME.team_home_score);
	$('#team_away_score').attr('value', GAME.team_away_score);
}

function volleyball_init () {
    $('#volleyball_current_set').text(GAME.current_set);
    $('#volleyball_team_home_wins').text(GAME.team_home_wins);
    $('#volleyball_team_away_wins').text(GAME.team_away_wins);
    $('#volleyball_team_home_points').attr('value', GAME.sets[GAME.current_set-1].team_home_points);
    $('#volleyball_team_away_points').attr('value', GAME.sets[GAME.current_set-1].team_away_points);
    if(GAME.current_set_type === 'tiebreak'){
        $('#volleyball_current_set_type').text('Tiebreak');
    }
}
/*
************************************** Initial stuff ****************************************
*/
socket.on('initial game state', function (state) {
	GAME = state;
	$('#event_name').text(GAME.event_name);
	$('.team_home').text(GAME.team_home);
	$('.team_away').text(GAME.team_away);
	switch(GAME.sport.toLowerCase()){
		case 'football':
			football();
			break;
		case 'volleyball':
			volleyball();
			break;
		default:
			console.log('ERROR: Event from database contains invalid sport type.');
	}
});


/*
************************************** Common listeners****************************************
*/

//join the specific event
socket.on('connect', function(){
    // socket to connect to event-based room
    socket.emit(room);
    console.log('joined room!');
});

$('#saveGame').click(function (){
	socket.emit('save game');
	window.location.replace('/pastevents');
});

/*
************************************** Other functions ****************************************
*/

/**
 * Function to change the score of a team
 * @param  {Strong} scoreTeam Name of the team that scored
 * @param  {Number} newScore  New score of the team
 */
function changeScore (scoreTeam, newScore) {
	var out = {
		score: newScore,
		team: scoreTeam
	}
	socket.emit('update score', out);
}

function volleyballChangePoints (pointsTeam, newPoints) {
	var newPointsInfo = {
		points: newPoints,
		team: pointsTeam
	}
	socket.emit('volleyball update points', newPointsInfo);
}

function volleyballUpdateSet (team) {
	if(team === 'home'){
		GAME.team_home_wins++;
		if(GAME.team_home_wins >= GAME.sets_win){
			volleyballWin(team);
		} else {
			volleyballNewSet();
		}
	} else{
		GAME.team_away_wins++;
		if(GAME.team_away_wins >= GAME.sets_win){
			volleyballWin(team);
		} else {
			volleyballNewSet();
		}
	}
	GAME.sets[GAME.current_set-1] = {};
	GAME.sets[GAME.current_set-1].team_home_points = 0;
	GAME.sets[GAME.current_set-1].team_away_points = 0;
	socket.emit('volleyball update set', GAME);
}

function volleyballNewSet (){
	GAME.current_set++;
	if(GAME.current_set === (2*(GAME.sets_win-1)+1)){
		GAME.current_set_type = 'tiebreak';
		GAME.sets_pts = GAME.sets_tie_pts;
	}
}
function volleyballWin (team){
	if(team === 'home'){
		GAME.winner = GAME.team_home;
	} else{
		GAME.winner = GAME.team_away;
	}
	$('#volleyball_status').text('Game finished');
	GAME.current_set = GAME.winner + " won!";
	$('.scorebutton').addClass('hidden');
	$('#saveGameModal').removeClass('hidden');
	socket.emit('volleyball win', team);
}