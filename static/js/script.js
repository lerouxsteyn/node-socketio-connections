$(function() {

	///////////////////////////////////////////
	//             Connection                //
	///////////////////////////////////////////

	var socket = io.connect();
	var room;

	//Assign room ID
	socket.on('send_id', function(data){
		room = data;
		$('#roomid').html('<strong>ID:</strong> '+data);
	});

	//Send connection request
	$('#connect').bind('click', function() {
		var req_room = $('#inputid').val().toUpperCase();
		if(req_room.length == 5) {
			if(req_room != room) {
				//try to connect
				socket.emit('connection_request', req_room);
			} else {
				//already joined this room
				alert('You have already joined this ID.');
			}
		} else {
			//very basic validation fail
			alert('Please enter a valid ID.');
		}
	});

	//Connection reply
	socket.on('connection_reply', function(data){
		if(data.status == 'success') {
			//SUCCESS!
			room = data.room;
			$('#actions, #output').removeClass('hide');
			$('.connect').fadeOut('slow');
			$('#roomid').html('<strong>ID:</strong> '+data.room);
			$('#inputid, #connect').attr('disabled', 'disabled'); //disable controls
			//alert('SUCCESS! Connected to '+data.room);
		} else {
			//error
			alert(data.error);
		}
	});

	//Receive message
	socket.on('server_message', function(data){
		$('#receiver').append('<li>' + data.msg + '</li>');
	});



	///////////////////////////////////////////
	//               Actions                 //
	///////////////////////////////////////////

	//Clear log
	$('#clear').bind('click', function() {
		$('#receiver').html('');
	});

	//Send test signal
	$('#send').bind('click', function() {
		socket.emit('client_message', { to: room, msg: 'Test signal.' });
	});

});