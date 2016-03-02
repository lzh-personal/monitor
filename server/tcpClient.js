/*
tcp server
获得数据
*/
var net = require('net');
var cp = require('child_process');
var server = net.createServer(function(socket){
	socket.on('data',function(data){
		console.log(data.toString());
	});
	socket.on('end',function(){
		console.log('connection discontected');
	});
	socket.on('error',function(err){
		console.log(err.message);
	})
});
server.listen(8889);