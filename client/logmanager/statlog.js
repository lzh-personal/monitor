var fs = require('fs'),
      toolFunc = require('../sysFunc.js'),
      myDate = new Date();
      //net caculate error;
/*++++++cpu使用率日志数据+++++++
line1:日志更新时间
section1:cpu名 用户 nice为负 系统 空闲 IO等待 硬中断 软中断 其他系统 访客 nice为负的访客cputime
各个逻辑CPU数据构造同上
section2::cpu名Percent:用户|nice为负|系统|空闲|IO等待|硬中断|软中断|其他系统|访客|nice为负的访客cputime(所有数值均是采样时间间隔内的CPU占用率)
各个逻辑CPU数据构造同上
日志刚刚创建时没有section2
由于更新进程日志需要之前的CPU日志信息，所需CPU日志在进程更新完成后更新
++++++++++++++++++++++++++++++*/
exports.statlog = new Promise(function(resolve,reject){
	fs.exists('./logmanager/stat.log',function(exists){
	if(!exists){
		//在没有cpu日志文件时首先初始化cpu日志文件
		return new Promise(function(resolve,reject){
			fs.readFile('/proc/stat',function(err,data){
			if(err) throw err;
			var ends = 'last_update_time:'+myDate.getTime()+'\n';
			var datas = data.toString().match(/cpu\d*?.*\n/g);
			ends += datas.join('');
			resolve(ends);
		});
		})
		.then(function(ends){
			return new Promise(function(resolve,reject){
				fs.open('./logmanager/stat.log','w+',function(err,fd){
					if(err) throw err;
					resolve([ends,fd]);
				});
			})
		},function(){
			//err control
		})
		.then(function(value){
			var ends = value[0],
			       fd = value[1];
			return new Promise(function(resolve,reject){
				fs.writeFile('./logmanager/stat.log',ends,function(err){
				if(err) throw err;
				fs.closeSync(fd);
				//resolve();
			});
			})
		},function(){
			//err control
		})
		.then(function(){
			console.log('stat.log saved!');
			resolve();
		},function(){})
	}else{
		resolve();
	}
	});
})
	
.then(function(){
	return new Promise(function(resolve,reject){
		fs.readFile('/proc/stat',function(err,data){
			if(err) throw err;
			var ends = 'last_update_time:'+myDate.getTime()+'\n';
			var newdata = data.toString().match(/cpu\d*?.*\n/g);
			ends += newdata.join('');		
			resolve([ends,newdata]);
		});
	});
},function(){
	//err control
})
.then(function(value){
	var ends = value[0],
	      newdata = value[1];
	      return new Promise(function(resolve,reject){
		fs.readFile('./logmanager/stat.log',function(err,data){
		if(err) throw err;
		var olddata = data.toString().match(/cpu\d*?.*\n/g);
		for(var x = 0;x<newdata.length;x++){
			var device = new Array();
			var name = newdata[x].match(/cpu\d*/);
			var newline = newdata[x].match(/\b\d+\b/g);
			var oldline = olddata[x].match(/\b\d+\b/g);
			for(var y = 0;y<newline.length;y++){
			if(oldline[y])
				device.push(Number(newline[y])-Number(oldline[y]));
			else	
				device.push(Number(newline[y]));
			}
			var sum = 0;
			device.forEach(function(value){sum += value;});
			ends += name+'Percent:';
			for(var y = 0;y<device.length;y++){
				ends += (Number(device[y])/Number(sum)).toString()+'|';
			}
			ends += '\n';	
		}
		
			resolve(ends);
		});
		});
},function(){
	//err control
	console.log("reject");
})
.then(function(ends){
	return new Promise(function(resolve,reject){
	fs.writeFile('./logmanager/stat.log',ends,function(err){
	if(err) throw err;
		console.log('stat.log updated!');
		resolve();
	})
});
},function(){});
/*/ final return
exports.sysInfo = Promise.all([netInfo,diskInfo,processInfo]).then(function(value){
	return new Promise(function(resolve,reject){
		resolve();
	});
},function(value){
})
*/