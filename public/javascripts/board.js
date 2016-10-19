//==================
// Game variables
//==================

var FIRST_CONFIG = true;
var SPORT = '';
var GAME;

/*
************************************** Initial stuff ****************************************
*/
//Sport type!
$(document).ready(function(){
    SPORT = $('#sport-type').data('sport').toLowerCase();
    console.log('Sport: '+ SPORT);
    switch(SPORT){
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
    GAME = initialState;
    if (FIRST_CONFIG) {
        $('#tournamentlogo').attr('src', GAME.tournament_logo);
        $('#team_home').text(GAME.team_home);
        $('#team_away').text(GAME.team_away);
        switch(SPORT){
            case 'football':
                football_init();
                break;
            case 'volleyball':
                volleyball_init();
                break;
            default:
                console.log('ERROR: Event from database contains invalid sport type.');
        }
        FIRST_CONFIG = false;
    }
});

//Receive viewers update
socket.on('update viewer count', function(viewers){
    $('#viewer-count').text('Live viewers: '+viewers);
});

/*** Implement comment logic ****/
function sendMessage() {
    var user = $('#input-username').val();
    var msg = $('#input-message').val();
    if(msg){
        socket.emit('comment-msg',{message: msg, username: user });
    }
}
socket.on('comment-new-msg', function (data){
    var comment = "<div class='comment-container'><span class='bold'>"+data.username+":</span><span class='comment-message'> "+data.message+"</span></div>";
    $('.comment-box').prepend(comment);
});


/*
************************************** Main Functions ****************************************
*/

function football () {
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
        if(newScoreInfo.team === 'home'){
            GAME.team_home_score = newScoreInfo.score;
        } else {
            GAME.team_away_score = newScoreInfo.score;
        }
        football_init();
    });
}

function volleyball () {
    socket.on('volleyball update points signal', function (newPointsInfo){
        if(newPointsInfo.team === 'home'){
            GAME.sets[GAME.current_set-1].team_home_points = newPointsInfo.points;
        } else {
            GAME.sets[GAME.current_set-1].team_away_points = newPointsInfo.points;
        }
        volleyball_init();
    })

    socket.on('volleyball update set signal', function (updateGame){
        //updates the whole GAME object received from remote
        GAME = updateGame;
        volleyball_init();
    })

    socket.on('volleyball win signal', function (team){
        $('#volleyball_status').text('Game finished');
        $('#volleyball_current_set_type').text('');
        $('#volleyball_current_set').text($('#team_'+team).text() + ' won!');
    })
}
/*
************************************** Initial Functions ****************************************
*/
function football_init () {
    $('#team_home_score').text(GAME.team_home_score);
    $('#team_away_score').text(GAME.team_away_score);
}

function volleyball_init () {
    $('#volleyball_current_set').text(GAME.current_set);
    $('#volleyball_team_home_wins').text(GAME.team_home_wins);
    $('#volleyball_team_away_wins').text(GAME.team_away_wins);
    $('#volleyball_team_home_points').text(GAME.sets[GAME.current_set-1].team_home_points);
    $('#volleyball_team_away_points').text(GAME.sets[GAME.current_set-1].team_away_points);
    if(GAME.current_set_type === 'tiebreak'){
        $('#volleyball_current_set_type').text('Tiebreak');
    }
}

/*
************************************** Other functions ****************************************
*/

//extract the name of the socket.io room, based on the url
function currentRoom () {
    var pathArray = window.location.pathname.split( '/' );
    return pathArray[pathArray.length - 1];
}