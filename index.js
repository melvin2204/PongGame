var port = 2204;

var express = require('express');
var socket = require('socket.io');
var fs = require("fs");

// app setup
var app = express();
var server = app.listen(port, function(){
	console.log("Listening on port " , port);
});

//static files
app.use(express.static('public'));

//socket setup
var io = socket(server);

io.on('connection', function(socket){
	console.log("Made socket connection", socket.id);
	socket.emit("handshake",{id:socket.id});
	socket.on('makeRoom',function(data) {
		console.log("Receive 'makeRoom' request: ", data);
		if (!fs.existsSync("rooms/" + data.roomId + ".json")) {
			fs.writeFile("rooms/" + data.roomId + ".json", JSON.stringify(data), function(err){
				if (err) {
					return console.log(err);
				}
				console.log("Made room for ",data.roomId);
				socket.emit("makeRoom",{done: true,room: data.roomId});
			});
		}else{
			console.log("Room already in use.", data.roomId);
			socket.emit("makeRoom",{done: false});
		}
	});
	socket.on("connectRoom",function(data){
		var response = {};
		if (fs.existsSync("rooms/" + data.roomId + ".json")) {//room exits
			response.found = true;
			fs.readFile("rooms/" + data.roomId + ".json", "utf8" , function(err,datafile) {
				if (err) {
					console.log(err)
					response.found = false;
				}
				response.data = JSON.parse(datafile);
				var host = response.data.host;
				console.log("Found corresponding host: ",host);
				//sending message to host 
				if (io.sockets.connected[host]) {
					io.sockets.connected[host].emit("roomJoin",data);
					console.log('Messaged ',host);
					response.hostOnline = true;
					fs.unlink("rooms/" + data.roomId + ".json",function(){});

				}else{
					console.log("Failed to message ", host);
					response.hostOnline = false;
					fs.unlink("rooms/" + data.roomId + ".json",function(){});
				}
				socket.emit("connectRoom",JSON.stringify(response));
			});
		}else{
			response.found = false;
			socket.emit("connectRoom",JSON.stringify(response));
		}
	});
	socket.on('sync',function(data){
		//sync data with requested id.
		if (io.sockets.connected[data.receiver]) {
			io.sockets.connected[data.receiver].emit("sync",data);
		}else{
			socket.emit("userDisconnect","");
		}
	});
	socket.on('reset',function(data){
		if (io.sockets.connected[data.receiver]) {
			io.sockets.connected[data.receiver].emit("reset",data);
		}else{
			socket.emit("userDisconnect","");
		}
	});
	socket.on('pauseGame',function(data){
		if (io.sockets.connected[data.receiver]) {
			io.sockets.connected[data.receiver].emit("pauseGame",data);
		}else{
			socket.emit("userDisconnect","");
		}
	});
	socket.on('pingTest',function(data){
		if (io.sockets.connected[data.receiver]) {
			io.sockets.connected[data.receiver].emit("pingTest",data);
		}else{
			socket.emit("userDisconnect","");
		}
	});
});