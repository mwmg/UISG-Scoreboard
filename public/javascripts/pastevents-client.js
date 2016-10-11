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
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            siteContent +="<div class='dyn-box-event'><figure>";
            siteContent +="<p>"+this.team_home+"</p>";
            siteContent +="<p>"+this.team_home_score+"</p>";
            siteContent +="<p>"+this.team_away+"</p>";
            siteContent +="<p>"+this.team_away_score+"</p>";
            siteContent +="</figure></div>";
        });

        // Inject the whole content string into our existing HTML table
        $('#pasteventsList').html(siteContent);
    });
};