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
        case 'basketball':
            basketball();
            break;
        default:
            console.log('ERROR: Event from database contains invalid sport type.');
    }
    $('#input-message').keypress(function(e){
        if(e.keyCode==13) $('#input-send').click();
    });
    $('#input-send').click(function (){
        sendMessage();
        $('#input-message').val('');
    });
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
        $('#event_name').text(GAME.event_name);
        $('#team_home').text(GAME.team_home);
        $('#team_away').text(GAME.team_away);
        switch(SPORT){
            case 'football':
                football_init();
                break;
            case 'volleyball':
                volleyball_init();
                break;
            case 'basketball':
                basketball_init();
                break;
            default:
                console.log('ERROR: Event from database contains invalid sport type.');
        }
        FIRST_CONFIG = false;
    }
});
//socket to receive existing comments
socket.on('initial comments', function (data){
    console.log(data);
    for(var i = 0; i < data.length; i++){
        var comment = "<div class='comment-container'><span class='comment-username'>"+data[i].username+"</span><span class='comment-message'> "+data[i].message+"</span></div>";
        $('.comment-box').prepend(comment);
    }
});

//Receive viewers update
socket.on('update viewer count', function (viewers){
    $('p#viewer-count').text('Live viewers: '+viewers);
});

/*** Implement comment logic ****/
function sendMessage() {
    var user;
    if($('#input-username').val() === ''){
        user = 'Anonymous';
    } else {
        user = $('#input-username').val();
    }
    var msg = $('#input-message').val();
    if(msg){
        socket.emit('comment-msg',{message: msg, username: user });
    }
}
socket.on('comment-new-msg', function (data){
    var comment = "<div class='comment-container'><span class='comment-username'>"+data.username+"</span><span class='comment-message'> "+data.message+"</span></div>";
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

function basketball() {
    // receive timer update
    socket.on('current countdown print', function (printTime){
        $('#basketball_timer').text(printTime);
    });

    //When game finishes
    socket.on('current countdown status',function(status){
        if(status === 'game finished'){
            document.getElementById('buzzer').play();
            $('#basketball_timer').css('color', 'red');
        }
    });

    // socket to update the score
    socket.on('update score signal', function (newScoreInfo) {
        if(newScoreInfo.team === 'home'){
            GAME.team_home_score = newScoreInfo.score;
        } else {
            GAME.team_away_score = newScoreInfo.score;
        }
        basketball_init();
    });

    // socket to update the fouls
    socket.on('update foul signal', function (newFoulInfo) {
        if(newFoulInfo.team === 'home'){
            GAME.team_home_foul = newFoulInfo.foul;
        } else {
            GAME.team_away_foul = newFoulInfo.foul;
        }
        basketball_init();
    });

    socket.on('change period signal', function (newPeriod){
        GAME.current_quarter = newPeriod;
        basketball_init();
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

function basketball_init () {
    $('#team_home_score').text(GAME.team_home_score);
    $('#team_away_score').text(GAME.team_away_score);
    $('#team_home_foul').text(GAME.team_home_foul);
    $('#team_away_foul').text(GAME.team_away_foul);
    $('#basketball_current_quarter').text(GAME.current_quarter);
}

/*
************************************** Other functions ****************************************
*/

//extract the name of the socket.io room, based on the url
function currentRoom () {
    var pathArray = window.location.pathname.split( '/' );
    return pathArray[pathArray.length - 1];
}