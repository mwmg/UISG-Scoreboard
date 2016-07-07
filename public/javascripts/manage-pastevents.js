// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the event table on initial page load
    populateTable();
    $("#pasteventsList table tbody").on('click','tr', function() {
        var id = $(this).data("id");
        document.location = '/manager/pastevents/delete/' + $(this).data("id");
    });

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
            tableContent += '<tr data-id="'+this._id+'">';
            tableContent += '<td>'+this.team_home.name+'</td>';
            tableContent += '<td>' + this.team_home.score + '</td>';
            tableContent += '<td>'+this.team_away.score+'</td>';
            tableContent += '<td>' + this.team_away.name + '</td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#pasteventsList table tbody').html(tableContent);
    });
};