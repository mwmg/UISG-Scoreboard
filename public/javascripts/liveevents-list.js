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
    $.getJSON( '/live/list', function( data ) {
    	console.log("Got data!");
    	console.log(data);
        if(data.length == 0){
            siteContent = "<p>No live events right now.</p><p>Please come back later!</p>";
        }
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            siteContent +="<div class='dyn-box-event'><a href='/live/event/"+ this.room +"'>";
            siteContent +="<div class='col-xs-4'><p class='team-title'>"+this.team_home+"</p>";
            if(this.team_home_logo) siteContent +="<img class='box-logo' src='data:image/png;base64,"+ this.team_home_logo+"' alt='Team home logo'>";
            siteContent +="</div>";
            siteContent +="<div class='col-xs-4'><p>"+this.event_name+"</p>";
            if(this.event_logo) siteContent +="<img class='box-logo' src='data:image/png;base64,"+ this.event_logo+"' alt='event logo'>";
            siteContent +="</div>";
            siteContent +="<div class='col-xs-4'><p class='team-title'>"+this.team_away+"</p>";
            if(this.team_away_logo) siteContent +="<img class='box-logo' src='data:image/png;base64,"+ this.team_away_logo+"' alt='Team away logo'>";
            siteContent +="</div>";
            siteContent +="</a></div>";
        });

        // Inject the whole content string into our existing HTML table
        $('#eventsList').html(siteContent);
    });
};