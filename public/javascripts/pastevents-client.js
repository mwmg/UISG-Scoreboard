// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the event table on initial page load
    populateSite();

});
// Functions =============================================================

// Fill table with data
function populateSite() {

    // Empty content string
    var siteContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/pastevents/list', function( data ) {
    	console.log("Got data!");
    	console.log(data);
        if(data.length == 0){
            siteContent = "<p>No past events yet.</p><p>Please come back later!</p>";
        }
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            var team_home_value, team_away_value;
            if(this.sport.toLowerCase() === 'football') {
                team_home_value = this.team_home_score;
                team_away_value = this.team_away_score;
            } else if (this.sport === 'volleyball'){
                team_home_value = this.team_home_wins;
                team_away_value = this.team_away_wins;
            } else {
                console.log('weird sport, nerd.');
                console.log(this);
            }

            siteContent +="<div class='dyn-box-event'>";
            siteContent +="<div class='col-xs-4'><p class='team-title'>"+this.team_home+"</p>";
            siteContent +="<p class='team-score'>"+team_home_value+"</p>";
            //siteContent +="<img class='box-logo' src='"+ this.team_home_logo+"' alt='Team home logo'>";
            siteContent +="</div>";
            siteContent +="<div class='col-xs-4'><p>"+this.event_date+"</p><p>"+this.event_name+"</p>";
            //siteContent +="<img class='box-logo' src='"+ this.event_logo+"' alt='event logo'>";
            siteContent +="</div>";
            siteContent +="<div class='col-xs-4'><p class='team-title'>"+this.team_away+"</p>";
            siteContent +="<p class='team-score'>"+team_away_value+"</p>";
            //siteContent +="<img class='box-logo' src='"+ this.team_away_logo+"' alt='Team away logo'>";
            siteContent +="</div>";
            siteContent +="</div>";
        });

        // Inject the whole content string into our existing HTML table
        $('#pasteventsList').html(siteContent);
    });
};