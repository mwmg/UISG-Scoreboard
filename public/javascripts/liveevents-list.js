// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the event table on initial page load
    populateTable();
    $("#eventsList table tbody").on('click','tr', function() {
        document.location = '/live/event/' + $(this).data("room");
    });

});
// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/live/list', function( data ) {
    	console.log("Got data!");
    	console.log(data);
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr data-room='+this.room+'>';
            tableContent += '<td>'+this.sport+'</td>';
            tableContent += '<td>' + this.team_home + '</td>';
            tableContent += '<td>'+this.team_away+'</td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#eventsList table tbody').html(tableContent);
    });
};