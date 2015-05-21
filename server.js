///////////////////////////////////////////
//               Setup                   //
///////////////////////////////////////////

//Dependencies
var ip_address = '10.132.22.228';
var ip_address = '0.0.0.0';
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081);

//Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//Errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { 
            locals: { 
                title : '404 - Not Found'
                ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});

//Socket.IO
var io = io.listen(server, ip_address);
io.sockets.on('connection', function(socket){
    var roomid = MakeID();
    socket.join(roomid);
    //console.log('Client '+socket.id+' connected, room '+roomid+' joined, emitting send_id.');
    socket.emit('send_id',roomid);

    socket.on('connection_request', function(data){
        var rooms = Object.keys(io.sockets.manager.rooms);
        if(rooms.indexOf('/' + data) >= 0) {
            socket.join(data);
            socket.emit('connection_reply', { status: 'success', room: data });
            io.sockets.to(data).emit('server_message', { msg: 'Client connected.' });
        } else {
            socket.emit('connection_reply', { status: 'failed', error: 'ID does not exist.' });
        }
    });

    socket.on('client_message', function(data){
        io.sockets.to(data.to).emit('server_message', { msg: data.msg });
    });

    socket.on('disconnect', function(){
        //console.log('Client Disconnected.');
    });
});



///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

//Add all your routes here
server.get('/', function(req,res){
    res.render('desktop.jade');
});

//Mobile
server.get('/mobile', function(req,res){
    res.render('mobile.jade');
});

//500 Error
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//404 Not Found (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

//Start Listening
server.listen(port);
console.log('Listening on http://'+ip_address+':' + port);



///////////////////////////////////////////
//             Functions                 //
///////////////////////////////////////////

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

function MakeID(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}