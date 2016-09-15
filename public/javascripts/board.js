//==================
// Constants
//==================

var FIRST_CONFIG = true;

//==================
// Game variables
//==================

var initialConfig;
//Sport type!
$(document).ready(function(){
    var sport = $('#sport-type').data('sport').toLowerCase();
    console.log('Sport: '+sport);
});

//==================
// Socket.io stuff
//==================

var socket = io.connect();
var room = currentRoom();

//join the specific event
socket.on('connect', function(){
    // socket to connect to event-based room
    socket.emit(room);
    console.log('joined room!');
});


// socket to receive initial game configuration
socket.on('initial game state', function (initialState) {
    console.log(initialState);
    initialConfig = initialState;
    if (FIRST_CONFIG) {
        $('#tournamentlogo').attr('src', initialConfig.tournament_logo);
        var homehtml = '<h4 class="teamlabel">' + initialConfig.team_home + '</h4><h2 class="scorenumber" id="' + initialConfig.team_home + 'score"></h2>';
        var awayhtml = '<h4 class="teamlabel">' + initialConfig.team_away + '</h4><h2 class="scorenumber" id="' + initialConfig.team_away + 'score"></h2>';
        $('#teamhome').append(homehtml);
        $('#teamaway').append(awayhtml);
        setScore(initialConfig.team_home, initialConfig.team_home_score);
        setScore(initialConfig.team_away, initialConfig.team_away_score);
        FIRST_CONFIG = false;
    }
});

//Receive viewers update
socket.on('update viewer count', function(viewers){
    $('#viewer-count').text('Live viewers: '+viewers);
});
//Receive timer update
socket.on('current time print', function(printTime){
    $('#mainclock').text(printTime);
});

//When game finishes
socket.on('current time status',function(status){
    if(status === 'game finished'){
        document.getElementById('buzzer').play();
        $('#mainclock').css('color', 'red');
    }
});

// socket to update the score
socket.on('update score signal', function (newScoreInfo) {
    setScore(newScoreInfo.team, newScoreInfo.score);
});

//==================
// Functions
//==================

//extract the name of the socket.io room, based on the url
function currentRoom () {
    var pathArray = window.location.pathname.split( '/' );
    return pathArray[pathArray.length - 1];
}


//=====================
// Score stuff
//=====================

/**
 * Function to set the score of a team
 * @param {String} team  Name of the team
 * @param {Number} score Score of the team
 */
function setScore (team, score) {
    $('#' + team + 'score').text(score);
}