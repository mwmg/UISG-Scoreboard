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
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            siteContent +="<div class='dyn-box-event'><a href='/live/event/"+ this.room +"'>";
            siteContent +="<div class='col-xs-4'><p class='team-title'>"+this.team_home+"</p><img class='box-logo' src='"+ this.team_home_logo+"' alt='Team home logo'></div>";
            siteContent +="<div class='col-xs-4'><p>"+this.event_name+"</p><img class='box-logo' src='"+ this.event_logo+"' alt='event logo'></div>";
            siteContent +="<div class='col-xs-4'><p class='team-title'>"+this.team_away+"</p><img class='box-logo' src='"+ this.team_away_logo+"' alt='Team away logo'></div>";
            siteContent +="</a></div>";
        });

        // Inject the whole content string into our existing HTML table
        $('#eventsList').html(siteContent);
    });
};