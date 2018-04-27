const fps = 120;
var player1;
var player2;
var playerSpeed = 5;
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
	|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
	playerSpeed = 1.5;
}else {
	document.getElementById("calibrate").remove();
}
var keys = [];
var ball;
var ballSpeed = 1.02;
const playerWidth = 100;
const playerHeight = 10;
var refresh;
var paused = false;
var frame = 0,pings = 0;
var randomInt = 1;
var oldX = -1;
var newBallReceived = true;
var x,y,calY,calX;
var ping;
var pingStart,pingResult;
var ballResetTimeout;
var p1Score = 0,p2Score = 0;
var updateObjects = [];
var autoPause = false;
var noSleep = new NoSleep();
var Canvas = {
	canvas: document.createElement("canvas"),
	start: function() {
		this.canvas.width = 900;
		this.canvas.height = 700;
		this.canvas.id = "canvas";
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas,document.body.childNodes[0]);
	},
	clear : function() {
		this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
	}
}

function game() {
	if (!connected) return;
	update();
	if (((frame + 1) / 8) % 1 == 0) {
		sync();
	}
	if (frame == 0) {
		if (pings < 2) {
			pings++;
		}else{
			pingTest();
			pings = 0;
		}
	}
	render();
	if (frame == fps) {
		frame = 0;
	}else{
		frame++;
	}
}

function start(){
	calibrate();
	document.getElementById("loginScreen").remove();
	document.getElementById("title").remove();
	Canvas.start();
	refresh = setInterval(function(){
		game();
	}, 1000/fps);
	if (isHost) {
		player1 = new player(playerWidth,playerHeight,"white",(Canvas.canvas.width / 2) - (playerWidth / 2),Canvas.canvas.height - 20,true);
		player2 = new player(playerWidth,playerHeight,"grey",(Canvas.canvas.width / 2) - (playerWidth / 2),10,false);
	}else{
		player1 = new player(playerWidth,playerHeight,"grey",(Canvas.canvas.width / 2) - (playerWidth / 2),Canvas.canvas.height - 20,false);
		player2 = new player(playerWidth,playerHeight,"white",(Canvas.canvas.width / 2) - (playerWidth / 2),10,true);
	}
	ball = new ball(10,10,"white",(Canvas.canvas.width / 2) - (10 / 2),(Canvas.canvas.width / 2) - (10 /2));
}

function pause(other) {
	if (!connected) return;
	calibrate();
	if (paused) {
		refresh = setInterval(function(){
			game();
		}, 1000/fps);
		if (!(typeof other !== 'undefined')) {
		socket.emit("pauseGame", {
			receiver: otherID,
		});
		}
		paused = false;
	}else{
		new createText(Canvas.canvas.width/2,Canvas.canvas.height/2,"Pause","white","50px sans-serif",0);
		clearInterval(refresh);
		if (!(typeof other !== 'undefined')) {
		socket.emit("pauseGame", {
			receiver: otherID,
		});
		}
		paused = true;
	}
}

function player(width,height,color,x,y,playable) {
	this.width = width;
	this.height = height;
	this.color = color;
	this.x = x;
	this.y = y;
	this.playable = playable;
	ctx = Canvas.context;
	this.update = function(i){
		if (this.playable) {
			/*if (keys[38]) this.y -= playerSpeed;
			if (keys[40]) this.y += playerSpeed;*/
			if (keys[37]) this.x -= playerSpeed;
			if (keys[39]) this.x += playerSpeed;

			if(this.x < 0) this.x = 0;
			/*if (this.y < 0) this.y = 0;*/
			if (this.x + this.width >= Canvas.canvas.width) this.x = Canvas.canvas.width - this.width;
			/*if (this.y + this.height >= Canvas.canvas.height) this.y = Canvas.canvas.height - this.height;*/
		}
	}
	this.render = function(){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.width,this.height);
	}
}
function ball(width,height,color,x,y){
	this.width = width;
	this.height = height;
	this.color = color;
	this.x = x;
	this.y = y;
	this.xSpeed = 0;
	this.ySpeed = 1.5;
	ctx = Canvas.context;
	this.update = function() {
		if (newBallReceived == false) return
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		if(this.x < 0) {//linker muur
			this.x = 0;
			this.xSpeed = -this.xSpeed;
		}
		if (this.y < 0) {//speler2 verloren
			if (!isHost) win(1);
			/*ball.xSpeed = 0;
			ball.ySpeed = 0;*/
			//win(1);
		}
		if (this.x + this.width >= Canvas.canvas.width) {//rechter muur
			this.x = Canvas.canvas.width - this.width;
			this.xSpeed = -this.xSpeed;
		}
		if (this.y + this.height >= Canvas.canvas.height) {//speler1 verloren
			this.y = Canvas.canvas.height - this.height;
			//window.location.reload();
			if (isHost) win(2);
			/*ball.xSpeed = 0;
			ball.ySpeed = 0;*/
			//win(2)
		}
		var paddle = this.ySpeed > 0 ? player1 : player2;
		if (AABBIntersect(this.x,this.y,this.width,this.height, paddle.x, paddle.y, paddle.width, paddle.height)) {//botsing met player 1
			let n = (this.x + this.height - paddle.x)/(paddle.width + this.height);
			let phi = 0.25 * Math.PI * (2*n - 1);
			this.xSpeed = Math.sin(phi) * randomInt;
			if (Math.abs(this.ySpeed) < 10) {
				this.ySpeed = -this.ySpeed * ballSpeed;
			}else{
				this.ySpeed = -this.ySpeed;
			}
			if ((isHost && this.ySpeed < 0 ) || (!isHost && this.ySpeed > 0)) {
				socket.emit("sync", {
					receiver: otherID,
					ballX: ball.x,
					ballY: ball.y,
					ballXSpeed: ball.xSpeed,
					ballYSpeed: ball.ySpeed,
					randomInt: Math.round(random(1,10),0),
				});
				//console.log("Sending ball data. (x,y,xs,ys) ", ball.x,ball.y,ball.xSpeed,ball.ySpeed);
			}else{
				newBallReceived = false;
				ballResetTimeout = setTimeout(function(){
					win(0);
					//als er binnen 2 seconden geen locatie is van de bal -> reset.
				},2000);
			}
		}
	}
	this.render = function() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.width,this.height);
	}
}
function createText(x,y,text,color,font,seconds) {
	this.x = x;
	this.y = y;
	this.text = text;
	this.color = color;
	this.font = font;
	this.time = seconds * fps;
	ctx = Canvas.context;
	this.render = function(){
		ctx.font = this.font;
		ctx.fillStyle = this.color;
		ctx.textAlign = "center";
		ctx.fillText(this.text,this.x,this.y);
	}
	if (seconds == 0) {
		this.render();
	}
}

function AABBIntersect(ax,ay,aw,ah,bx,by,bw,bh) {
	return (
		ax < bx + bw &&
		ax + aw > bx &&
		ay < by + bh &&
		ay + ah > by
		);
}
function update(){
	if(!(calX == undefined)) orientationControls();
	player2.update();
	player1.update();
	ball.update();
}

function render(){
	Canvas.clear();//clear canvas
	new createText(20,Canvas.canvas.height/2 - 15,p2Score,"white","25px sans-serif",0);//show scores
	new createText(20,Canvas.canvas.height/2 + 15,p1Score,"white","25px sans-serif",0);//show scores
	player1.render();//render player1
	player2.render();//render player2
	ball.render();
	for (var i = updateObjects.length - 1; i >= 0; i--) {
		if (updateObjects[i].time > 0) {
			updateObjects[i].render();
			updateObjects[i].time--;
		}
	}
}

window.addEventListener("keydown", function(e){
	keys[e.keyCode] = true;
	if (e.keyCode == 80 || e.keyCode == 19 || e.keyCode == 27) pause(); //esc Pause/Break p -> pause();
}, false);
window.addEventListener("keyup", function(e){
	delete keys[e.keyCode];
}, false);

function random(min, max) {
	return Math.random() * (max - min) + min;
}

//socket stuff
if (window.location.hostname === "192.168.178.50") {
	var socket = io.connect("ws://192.168.178.50:2204");
}else{
	var socket = io.connect(window.location.protocol + '//' + window.location.hostname)
}
var selfID;
var otherID;
var room;
var connected = false;
var isHost = false;
socket.on("handshake",function(data){
	selfID = data.id;
	console.log("Handshake",selfID);
});
socket.on("userDisconnect",function(data){
	if (!connected) return;
	alert("Player disconnected");
	connected = false;
	window.location.reload();
});
socket.on("disconnect",function(data){
	if (!connected) return;
	alert("Lost connection to the server.");
	connected = false;
	window.location.reload();
});
socket.on("pauseGame",function(data){
	pause(true);
});
socket.on("connectRoom",function(data){
	if (connected) return
	var json = JSON.parse(data);
	if (json.found) {
		if (json.hostOnline) {
			otherID = json.data.host;
			room = json.data.roomId;
			connected = true;
			isHost = false;
			console.log("Found host. Host is ", otherID);
			start();
		}else{
			alert("Host is offline");
		}
	}else{
		alert("Invalid room.");
	}
});
socket.on("roomJoin",function(data){
	if (connected) return
	otherID = data.client;
	room = data.room;
	connected = true;
	isHost = true;
	console.log(otherID + " joined your room.");
	start();
});
socket.on("sync",function(data){
	if (typeof data.winSync !== 'undefined') {
		if (data.winner === 2) {
			ball.x = Canvas.canvas.width/2 - 10;
			ball.y = Canvas.canvas.height/2 - 10;
			ball.xSpeed = 0;
			ball.ySpeed = -1.5;
			player1.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
			player2.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
			p2Score++;
			updateObjects.push(new createText(Canvas.canvas.width/2,Canvas.canvas.height/2,"Player 2 scored","white","50px sans-serif",1));
			newBallReceived = true;
		}
		if (data.winner === 1) {
			ball.x = Canvas.canvas.width/2 - 10;
			ball.y = Canvas.canvas.height/2 - 10;
			ball.xSpeed = 0;
			ball.ySpeed = 1.5;
			player1.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
			player2.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
			p1Score++;
			updateObjects.push(new createText(Canvas.canvas.width/2,Canvas.canvas.height/2,"Player 1 scored","white","50px sans-serif",1));
			newBallReceived = true;
		}
		return;
	}
	if (typeof data.ballX !== 'undefined') {
		ball.x = data.ballX;
		ball.y = data.ballY;
		ball.ySpeed = data.ballYSpeed;
		ball.xSpeed = data.ballXSpeed;
		newBallReceived = true;
		clearTimeout(ballResetTimeout);
		randomInt = data.randomInt;
		//console.log("Received ball data. (x,y,xs,ys) ", data.ballX,data.ballY,data.ballXSpeed,data.ballYSpeed);
		/*let ping = Date.now() - data.time;
		document.getElementById("ping").innerHTML = "Ping (ms): " + ping;*/
		//console.log("Ping (ms): ", ping);
		return;//zodat de spelers niet steeds weggaan
	}
	if (isHost) {
		player2.x = data.p2x;
	}else{
		player1.x = data.p1x;
	}
});
socket.on("makeRoom",function(data){
	if (data.done) {
		console.log("Made room." ,data.room);
		room = data.room;
		document.getElementById("actualLogin").innerHTML = "<p>Waiting for someone to join room '" + room + "'.<br>The game immediately starts when someone joins your room!</p>";
	}else{
		alert("This room is already in use.");
	}
});
socket.on("reset",function(data){
	ball.ySpeed = data.ballYSpeed;
	ball.x = Canvas.canvas.width/2 - 10;
	ball.y = Canvas.canvas.height/2 - 10;
	ball.xSpeed = 0;
	player1.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
	player2.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
	newBallReceived = true;
});
function win(who){
	/**
	0 = gelijk
	1 = player 1 win
	2 = player 2 win
	**/
	switch (who) {
		case 0:
			ball.x = Canvas.canvas.width/2 - 10;
			ball.y = Canvas.canvas.height/2 - 10;
			ball.xSpeed = 0;
			ball.ySpeed = 1.5;
			if (random(0,1) > 0.5) ball.ySpeed = 1.5;
			player1.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
			player2.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
			newBallReceived = true;
			updateObjects.push(new createText(Canvas.canvas.width/2,Canvas.canvas.height/2,"Reset ball","white","50px sans-serif",1));
			socket.emit("reset",{
				receiver: otherID,
				ballYSpeed: ball.ySpeed,
			});
			break;
		case 1:
			socket.emit("sync", {
				receiver: otherID,
				winSync: true,
				winner: 1,
			});
			ball.x = Canvas.canvas.width/2 - 10;
			ball.y = Canvas.canvas.height/2 - 10;
			ball.xSpeed = 0;
			ball.ySpeed = 1.5;
			player1.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
			player2.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
			p1Score++;
			updateObjects.push(new createText(Canvas.canvas.width/2,Canvas.canvas.height/2,"Player 1 scored","white","50px sans-serif",1));
			break;
		case 2:
			socket.emit("sync", {
				receiver: otherID,
				winSync: true,
				winner: 2,
			});
			ball.x = Canvas.canvas.width/2 - 10;
			ball.y = Canvas.canvas.height/2 - 10;
			ball.xSpeed = 0;
			ball.ySpeed = -1.5;
			player1.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
			player2.x = (Canvas.canvas.width / 2) - (playerWidth / 2);
			p2Score++;
			updateObjects.push(new createText(Canvas.canvas.width/2,Canvas.canvas.height/2,"Player 2 scored","white","50px sans-serif",1));
			break;
		default:
			// statements_def
			break;
	}
}
function makeRoom(id) {
	if (connected) return
	socket.emit("makeRoom", {
		roomId: id,
		host: selfID
	});
}
function connectRoom(id) {
	if (connected) return
	if (room == id) {
		alert("You can't join your own room.");
		return;
	}
	socket.emit("connectRoom",{
		roomId: id,
		client: selfID
	});
}
function sync(){
	/*socket.emit("sync", {
		receiver: otherID,
		ballX: ball.x,
		ballY: ball.y,
		p1x: player1.x,
		p1y: player1.t,
		p2x: player2.x,
		p2y: player2.y
	});*/
	if (isHost) {
		if (oldX == player1.x) return
		socket.emit("sync", {
		receiver: otherID,
		/*ballX: ball.x,
		ballY: ball.y,
		ballXSpeed: ball.xSpeed,
		ballYSpeed: ball.ySpeed,*/
		p1x: player1.x,
		});
		oldX = player1.x;
	}else{
		if (oldX == player2.x) return
		socket.emit("sync", {
		receiver: otherID,
		p2x: player2.x,
		});
		oldX = player2.x;
	}
}
function uiConnectRoom(){
	let id = document.getElementById("join").value;
	connectRoom(id);
}
function uiMakeRoom(){
	let id = document.getElementById("make").value;
	makeRoom(id);
}
if (window.DeviceOrientationEvent) {
	window.addEventListener('deviceorientation', handleOrientation);
}
function calibrate() {
	calX = x;
	calY = y;
}
function handleOrientation(e) {
	x = event.beta; // range [-180,180]
	y = event.gamma // range [-90,90]
}
function orientationControls(){
	if (calX == undefined || calY == undefined) console.log('not calibrated! use calibrate() to calibrate the device');
	var offsetX = 2;
	var offsetY = 4;
	/*if (x > calX + offsetX) {
		//console.log('backwards');
		keys[40] = true;
	}else{
		delete keys[40];
	}*/
   /* if (x < calX - offsetX) {
		//console.log('forwards');
		keys[38] = true;
	}else{
		delete keys[38];
	}*/
	if (y > calY + offsetY - 3) {
		//console.log('right');
		if (y > calY + offsetY + 3) {
			playerSpeed = 3;
		}else{
			playerSpeed = 1.5;
		}
		keys[39] = true;
	}else{
		delete keys[39];
	}
	if (y < calY - offsetY) {
		//console.log('left');
		if (y > calY - offsetY - 3) {
			playerSpeed = 1.5;
		}else{
			playerSpeed = 3;
		}
		keys[37] = true;
	}else{
		delete keys[37];
	}
}
function pingTest() {
	pingStart = Date.now();
	socket.emit("pingTest", {
		receiver: otherID,
		responded: false,
	});
}
socket.on("pingTest",function(data){
	pingResult = Date.now() - pingStart;
	if (data.responded) document.getElementById("ping").innerHTML = "Ping (ms): " + pingResult;
	if (data.responded) return;
	socket.emit("pingTest", {
		receiver: otherID,
		responded: true,
	});
});
window.onblur = function() {
	if (paused == false && connected && autoPause) {
		pause();
	}
}
window.onfocus = function() {
	if (paused && connected && autoPause) {
		pause();
	}
}
window.onload = function () {
	if (window.location.search.substr(1) != "") {
		setTimeout(function(){connectRoom(window.location.search.substr(1));},1000);
	}
}
function enableNoSleep() {
  noSleep.enable();
  document.removeEventListener('click', enableNoSleep, false);
}
document.addEventListener('click', enableNoSleep, false);
