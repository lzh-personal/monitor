var net = require('net');
var fs = require('fs');
var cp = require('child_process');
var logUpdateTime,dataPushTime;
var sysFunc = require('./sysFunc.js');
new Promise(function(resolve,reject){
	fs.readFile('./configSys.json',function(err,data){
	if (err) reject(err);
	try{
		var data =  JSON.parse(data.toString());
			logUpdateTime = data.logUpdateTime,
			dataPushTime = data.dataPushTime;
			resolve();
	}catch(e){
		reject(e);
	}
	})
})
.then(function(){
	return new Promise(function(resolve,reject){
		cp.exec("sudo node ./logmanager/logManager.js -f",function(err){
			//开机第一次运行会初始化相关日志参数，但生成的不是可使用的监控日志
				if(err) reject(err);
				resolve();
		});
	})
},function(err){
	throw err;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
})
.then(function(){
	return new Promise(function(resolve,reject){
			cp.exec("sudo node ./logmanager/logManager.js",function(err){
				if (err) reject(err);
				//再次更新日志
			resolve();
			});
	});
},function(err){
	throw err;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
})
.then(function(){
	//开始定时更新日志
	var proLog = new Promise(function(resolve,reject){
		setInterval(function(){
			cp.exec("sudo node ./logmanager/logManager.js",function(err){
				if (err) reject(err);
			});
		},logUpdateTime);
	})
	.then(function(){},function(err){
		err.subType = 0x0001;
		throw err;
	})
	.catch(function(reason){
		sysFunc.errorHandler(reason);
	})
		
	//开始定时向服务器推送数据
	/*
	TCP client
	实现将被监控主机中的数据传输出去
	tcp server IP：127.0.0.1:8889
	*/
	var proNet = new Promise(function(resolve,reject){
		setInterval(function(){
			var client = net.connect({port:8889,host:'127.0.0.1'});
			client.on('connect',function(){
				cp.exec("node ./dataCollector/taskManager.js",function(err,stdout,stderr){
				if(err) reject(err);
				stdout = new Buffer(stdout);
				client.write(stdout);
				client.end();
				});
			});
			client.on('error',function(err){
				reject(err);
			})
		},dataPushTime);
	})
	.then(function(){},function(err){
		err.subType = 0x0002;
		throw err;
	})
	.catch(function(reason){
		//console.log(reason);
		sysFunc.errorHandler(reason);
	})
		
},function(err){
	throw err;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
})