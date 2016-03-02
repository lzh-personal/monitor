var express = require('express');
var cluster = require('cluster');
var net = require('net');
var om = require("./bigMemControler.js");
if(cluster.isMaster){
/*****************************************
*master进程
*使用express向上层提供HTTP服务
*****************************************/
	console.log("master");
	var app = express();
	var cache = new om.objectManager({
		maxAge:20,
		timeout:60*60*1000,
		interval:24*60*60*1000,
		maxSize:1000
	});
	app.listen(8888);
	app.get('/jobmaker', function (req, res) {
  		res.send('Hello World!');
	});
	app.use(express.static('html'));
	//启动worker进程，并监听message事件
	var worker = cluster.fork();
	worker.on('message',function(msg){
	//处理收到的数据
		console.log(msg);

	})
}else if(cluster.isWorker){
/******************************************
*worker进程
*启用TCP服务器收集下层的数据推送
******************************************/
	console.log("worker#"+cluster.worker.id);
	var server = net.createServer(function(socket){
	socket.on('data',function(data){
		//处理收集到的数据并将数据传送给master进程
		console.log(socket.remoteAddress);
		process.send(data.toString());
	});
	socket.on('end',function(){
		console.log('connection discontected');
	});
	socket.on('error',function(err){
		console.log(err);
	})
	});
	server.listen(8889);
}

