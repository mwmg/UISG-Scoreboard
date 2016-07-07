// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the event table on initial page load
    populateTable();

});
// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/pastevents/list', function( data ) {
    	console.log("Got data!");
    	console.log(data);
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td>'+this.team_home+'</td>';
            tableContent += '<td>' + this.team_home_score + '</td>';
            tableContent += '<td>'+this.team_away_score+'</td>';
            tableContent += '<td>' + this.team_away+ '</td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#pasteventsList table tbody').html(tableContent);
    });
};