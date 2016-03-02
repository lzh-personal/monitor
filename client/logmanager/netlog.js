      toolFunc = require('../sysFunc.js'),
      myDate = new Date();
/*+++++++网络信息日志文件++++++++++
line1:日志更新时间
网卡名：接受字节(开机至日志更新时刻)，发送字节(开机至日志更新时刻)，累计接收字节，累计发送字节
++++++++++++++++++++++++++++++++*/
exports.netInfo = new Promise(function(resolve,reject)	
fs.exists('./logmanager/net.log',function(exists){
	if(!exists){
		//如果没有网络信息日志，首先初始化日志文件
		return new Promise(function(resolve,reject){
			fs.open('./logmanager/net.log','w+',function(err,fd){
			if(err) throw err;
			var datas =  'last_update_time:' + myDate.getTime()+'\n';
			resolve([datas,fd]);
			});
		})
		.then(function(value){
			var datas = value[0],
			       fd = value[1];
			return new Promise(function(resolve,reject){
				fs.writeFile('./logmanager/net.log',datas,function(err){
				if(err) throw err;
				console.log('net.log is aready!');
				fs.closeSync(fd);
				resolve(1);
		});
			});
		},function(){
			// err control
		})
		.then(function(){
			toolFunc.timeControl('./logmanager/net.log',resolve);
		},function(){
			//err control
		})
		
	}else{
		toolFunc.timeControl('./logmanager/net.log',resolve);
		//resolve(0);
	}
});
})
.then(function(value){
	if(value === 0){
		//如果时开机第一次更新此日志
		return new Promise(function(resolve,reject){
			fs.readFile('/proc/net/dev',function(err,data){
			if(err) throw err;
			var net = data.toString().match(/.*\n/g);
			net = net.splice(2);
			var result = [];
			//turn net to a array
			for(var x = 0;x<net.length;x++){
				net[x] = net[x].toString().split(/\s+/g);
				result[x] = {};
				result[x].name = net[x][1].replace(/:/,'');
				result[x].data = net[x][1]+net[x][2]+','+net[x][10];
			}
			resolve(result);
			});
		})
		.then(function(result){
			return new Promise(function(resolve,reject){
			fs.readFile('./logmanager/net.log',function(err,data){
				if(err) throw err;
				console.log(result);
				var ends = "last_update_time:"+myDate.getTime()+'\n';
				for(var x = 0 ;x<result.length;x++){
					if(data.toString().indexOf(result[x].name+':') >0){
						var name = result[x].name;
						var pattern = new RegExp('net_'+name+":.*");
						var line = new RegExp('net_'+name+":.*\\n");
						var old = pattern.exec(data.toString());
						old = old.slice(0,1).toString();
						old = old.replace(/[a-zA-Z_]+\d*:/,'');
						old = old.split(',');
						result[x] = result[x].data.replace(/[a-zA-Z_]+\d*:/,'');
						result[x] = result[x].split(',');
						var newrx = Number(result[x][0]);
						var newtx = Number(result[x][1]);
						//开机第一次运行的累计数据直接累加
						var curx = Number(result[x][0])+Number(old[2]);
						var cutx = Number(result[x][1])+Number(old[3]);
						ends += 'net_' + name+':'+newrx+','+newtx+','+curx+','+cutx+'\n';

					}else{
						ends +='net_'+ result[x].name;
						result[x].data = result.data.slice(result.data.indexOf(':')+1,result.length);
						result[x] = result[x].split(',');
						ends += result[x][0]+','+result[x][1]+','+result[x][0]+','+result[x][1]+'\n';
						console.log(ends);	
					}	
				}
				resolve(ends);
			});
			});
		},function(){
			//err control
		})
		.then(function(ends){
			return new Promise(function(resolve,reject){
			fs.writeFile('./logmanager/net.log',ends,function(){
					console.log('net updated');
						resolve();
				});
			});
		},function(){
			//err control
		});
	}else if(value === 1){
		// /proc/net/dev 中记录的是开机发送和接受的总流量
		//如果开机后已经更新过此日至文件，相应累计数据不能只是简单累加
		return new Promise(function(resolve,reject){
			fs.readFile('/proc/net/dev',function(err,data){
			if(err) throw err;
			var net = data.toString().match(/.*\n/g);
			net = net.splice(2);
			var result = [];
			//turn net to a array
			for(var x = 0;x<net.length;x++){
				net[x] = net[x].toString().split(/\s+/g);
				var cx = Number(net[x][2])+Number(net[x][10]);
				result[x] = {};
				result[x].name = net[x][1].replace(/:/,'');
				result[x].data = net[x][1]+net[x][2]+','+net[x][10];
			}
			resolve(result);
		});
		})
		.then(function(result){
			return new Promise(function(resolve,reject){
				fs.readFile('./logmanager/net.log',function(err,data){
				if(err) throw err;
				var ends="last_update_time:"+myDate.getTime()+"\n";
				for(var x = 0 ;x<result.length;x++){
					if(data.toString().indexOf(result[x].name+':') >0){
						var name = result[x].name;
						var pattern = new RegExp('net_'+name+":[^\\n]*");
						var line = new RegExp('net_'+name+":[\\s\\S]*?\\n");
						var old = pattern.exec(data.toString());
						old = old.splice(0,1).toString();
						old = old.replace(/[a-zA-Z_]+\d*:/,'');
						old = old.split(',');
						result[x] = result[x].data.replace(/[a-zA-Z_]+\d*:/,'');
						result[x] = result[x].split(',');
						//不是开机第一次运行记录间隔时间内的接受和发送字节
						var newrx = Number(result[x][0])-Number(old[0]);
						var newtx = Number(result[x][1])-Number(old[1]);
						var curx = Number(result[x][0])-Number(old[0])+Number(old[2]);
						var cutx = Number(result[x][1])-Number(old[1])+Number(old[3]);
						ends += 'net_' + name+':'+newrx+','+newtx+','+curx+','+cutx+'\n';
					}else{
						ends +='net_'+ result[x].name+":";
						result[x].data = result[x].data.slice(result[x].data.indexOf(':')+1,result[x].length);
						result[x] = result[x].data.split(',');
						ends += result[x][0]+','+result[x][1]+','+result[x][0]+','+result[x][1]+'\n';	
					}
					
				}
				//console.log(ends);
				resolve(ends);
			});
			})	
		},function(){
			//err control
		})
		.then(function(ends){
			return new Promise(function(resolve,reject){
				fs.writeFile('./logmanager/net.log',ends,function(err){
					if(err) throw err;
					console.log('net.log update');
					resolve();
				});
			})	
		},function(){
			//err control
		});
	}
},function(){
	//err control
});
