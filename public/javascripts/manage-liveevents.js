// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the event table on initial page load
    populateTable();
    $("#eventsList table tbody").on('click','tr', function() {
        var room = $(this).data("room");
        if(action === 'delete') {
            document.location = '/manager/deleteliveevent/'+room;
        }else{
            document.location = '/manager/remote/'+room;
        }
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
            tableContent += '<td>'+this.event_name+'</td>';
            tableContent += '<td>' + this.team_home + '</td>';
            tableContent += '<td>'+this.team_away+'</td>';
            tableContent += '<td>'+this.room+'</td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#eventsList table tbody').html(tableContent);
    });
};