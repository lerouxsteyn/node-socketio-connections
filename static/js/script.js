$(function() {   

	var socket = io.connect();
	var room;

	//Assign room
	socket.on('send_id', function(data){
		room = data;
		$('#uniqueid').text('Room: '+data);
	});

	//Clear log
	$('#clear').bind('click', function() {
		$('#receiver').html('');
	});

	//Send connection request
	$('#connect').bind('click', function() {
		var req_room = $('#uniquecode').val().toUpperCase();
		if(req_room.length == 5) {
			socket.emit('connection_request', req_room);
		}
	});

	//Connection success
	socket.on('connection_success', function(data){
		$('#receiver').append('<li>' + data + '</li>');
	});

	//Send test signal
	$('#send').bind('click', function() {
		socket.emit('client_message', { to: room, msg: 'Test signal' });
	});

	//Receive message
	socket.on('server_message', function(data){
		$('#receiver').append('<li>' + data + '</li>');
	});

});