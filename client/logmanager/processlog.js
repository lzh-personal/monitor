var fs = require('fs'),
      toolFunc = require('../sysFunc.js'),
      myDate = new Date();
var setProcesslog = function(){
	return new Promise(function(resolve,reject){	
		fs.readdir('/proc',function(err,file){
			if(err) throw err;
			var processNames = file.toString().match(/\d+/g);
			var ends ='';
			ends += 'last_update_time:'+myDate.getTime()+'\n';
			for(var x = 0;x<processNames.length;x++){
				ends += processNames[x]+'|';
				var filename = '/proc/'+processNames[x]+'/status';
				var data = fs.readFileSync(filename);
				var datas;
			//name
				datas = data.toString().match(/[Nn]ame\s*:\s*([\w\/\-\_]+)/);
				ends += datas[1]+'|';
			//status
				datas = data.toString().match(/[Ss]tate\s*:\s*([Rr]|[Ss]|[dD]|[Zz]|[Tt]|[Xx])/);
				ends += datas[1]+'|';
			//username
				datas = data.toString().match(/[Uu]id\s*:\s*(\d+)/);
				var uid = datas[1];
				var unames = fs.readFileSync('/etc/passwd');
				var pattern = new RegExp('.*:'+uid+':');
				datas = pattern.exec(unames.toString());
				var name = datas[0].toString().match(/\w+/);
				ends += name+'|';
			//meminfo
				datas = data.toString().match(/VmRSS\s*:\s*(\d+)/);
				if(datas){
					ends += datas[1]+'|';
				}else{
					ends += '0|';
				}
				datas = data.toString().match(/VmSize\s*:\s*(\d+)/);
				if(datas){
					ends += datas[1]+'|';
				}else{
					ends += '0|';
				}
			//cmdline
				filename = '/proc/'+processNames[x]+'/cmdline';
				data = fs.readFileSync(filename);
				ends += data.toString()+'|';
			//iocounters
				filename = '/proc/'+processNames[x]+'/io';
				data = fs.readFileSync(filename);
				datas = data.toString().match(/\d+/g);
				ends += datas[0]+'|'+datas[1]+'|'+datas[4]+'|'+datas[5]+'|';
			//statinfo
				filename = '/proc/'+processNames[x]+'/stat';
				data = fs.readFileSync(filename);
				datas = data.toString().match(/\s*-?\d+\s/g);
				for(var y =0;y<datas.length;y++){
					datas[y] = datas[y].replace(/\s|\n/g,'');
				}
				var cputime = Number(datas[11])+Number(datas[12])+Number(datas[13])+Number(datas[14]);
				ends += datas[37]+'|';
				ends += cputime+'\n';
			}
			resolve(ends);
		});
	})
	.then(function(ends){
		return new Promise(function(resolve,reject){
			fs.open('./logmanager/process.log','w+',function(err,fd){
				if(err) throw err;
				resolve([ends,fd]);
			})
		})
	},function(){
		//err control
	})
	.then(function(value){
		var ends = value[0],
		      fd = value[1];
		return new Promise(function(resolve,reject){
			fs.writeFile('./logmanager/process.log',ends,function(err){
				console.log("process.log aready");
				fs.closeSync(fd);
				resolve();
			})
		})
	},function(){
		//err control
	})
}

/*++++++进程信息日志结构+++++
line1:日志更新时间
rest:PID|进程名|进程状态|进程用户名|进程地址空间大小|进程正在使用的物理内存大小|!!进程的线程数量|命令行|IO记数[4]|!!!!cpu使用率|cpu nice|cpu time(开机至更新时间点)
+++++++++++++++++++++++*/
exports.processInfo = new Promise(function(resolve,reject){
	fs.exists('./logmanager/process.log',function(exists){
	if(!exists){
		return setProcesslog();
	}else{
		toolFunc.timeControl('./logmanager/process.log',resolve);	
	}
	});
})
.then(function(value){
	if(value===1){
		return new Promise(function(resolve,result){
			fs.readFile('./logmanager/process.log',function(err,data){
				var cpuTimeCount,proTimeCount,cpuPercent;
				var ends = '';
				ends += 'last_update_time:'+myDate.getTime()+'\n';
				var oldData = data.toString();
				if(err) throw err;
				//get new process list
				resolve([ends,oldData]);
			});
		})
		.then(function(value){
			var ends = value[0],
			      oldData = value[1];
			return new Promise(function(resolve,reject){
				fs.readdir('/proc',function(err,file){
				if(err) throw err;
				var processNames = file.toString().match(/\d+/g);
				for(var x = 0;x<processNames.length;x++){
					try{
					var filename = '/proc/'+processNames[x]+'/status';
					var status = fs.readFileSync(filename);
					filename = '/proc/'+processNames[x]+'/stat';
					var newdata = fs.readFileSync(filename);
					filename = '/proc/'+processNames[x]+'/cmdline';
					var cmdline = fs.readFileSync(filename);
					newdata = newdata.toString().match(/\s*-?\d+\s/g);
					filename = '/proc/'+processNames[x]+'/io';
					var io = fs.readFileSync(filename);
					filename = '/proc/'+processNames[x]+'/stat';
					var prostat = fs.readFileSync(filename);
				}catch(e){
					throw e.message;
				}
					for(var y =0;y<newdata.length;y++){
						newdata[y] = newdata[y].replace(/\s|\n/g,'');
					}
					//get cputimes
				if(fs.existsSync('./logmanager/stat.log')){
					
					var data = fs.readFileSync('./logmanager/stat.log');
					var pattern = new RegExp('[cC]pu'+newdata[36]+'.*\\n');
					var processNice = newdata[37];
					var oldCpuData = pattern.exec(data);
					oldCpuData = oldCpuData[0].toString().match(/\d+/g);
					oldCpuData = oldCpuData.splice(1);
					var oldCpuTimes = 0;
					oldCpuData.forEach(function(value){oldCpuTimes+=Number(value);});
					data = fs.readFileSync('/proc/stat');
					var newCpuData = pattern.exec(data);
					newCpuData = newCpuData[0].toString().match(/\d+/g);
					newCpuData = newCpuData.splice(1);
					var nowCpuTimes = 0;
					newCpuData.forEach(function(value){nowCpuTimes+=Number(value);});
					cpuTimeCount = nowCpuTimes - oldCpuTimes;
					//console.log(cpuTimeCount+"\n"+nowCpuTimes+"\n"+oldCpuTimes);
					
				}else{
					throw "updating process.log need stat.log`s infomation";
				}

					var nowCpuTime = Number(newdata[11])+Number(newdata[12])+Number(newdata[13])+Number(newdata[14]);
					pattern = new RegExp('^'+newdata[0]+'.*$','m');
					var oldline = pattern.exec(oldData);
					if(oldline){
						//this process have old logs
						var oldCpuTime = oldline[0].toString().match(/\d+(\.\d+)?/g);
						oldCpuTime = oldCpuTime[oldCpuTime.length-1];	
						proTimeCount = Number(nowCpuTime)-Number(oldCpuTime);
					}else{
						//this process is a new process
						proTimeCount = Number(nowCpuTime);
					}
					cpuPercent = proTimeCount/cpuTimeCount;
					//create ends string to update logs
					ends += processNames[x]+'|';
					
					var datas;
				//name
					datas = status.toString().match(/[Nn]ame\s*:\s*([\w\/\-\_]+)/);
					if(datas)
						ends += datas[1]+'|';
					else
						ends += '|';
				//status
					datas = status.toString().match(/[Ss]tate\s*:\s*([Rr]|[Ss]|[dD])/);
					if(datas)
						ends += datas[1]+'|';
					else
						ends += '|';
				//username
					datas = status.toString().match(/[Uu]id\s*:\s*(\d+)/);
					var uid = datas[1];
					var unames = fs.readFileSync('/etc/passwd');
					var pattern = new RegExp('.*:'+uid+':');
					datas = pattern.exec(unames.toString());
					var name = datas[0].toString().match(/\w+/);
					if(name){
						ends += name+'|';
					}
					else{
						ends += '|';
					}
				//meminfo
					datas = status.toString().match(/VmRSS\s*:\s*(\d+)/);
					try{
						ends += datas[1]+'|';
					 }catch(e){
						ends += '0|';
					}
				
					datas = status.toString().match(/VmPeak\s*:\s*(\d+)/);
					try{
						ends += datas[1]+'|';
					}catch(e){
						ends += '0|';
					}
				//Treads
					datas = status.toString().match(/[tT]hreads\s*:\s*(\d+)/);
					ends += datas[1]+'|';
				//cmdline
					if(cmdline)
						ends += cmdline.toString()+'|';
					else
						ends += '|';
				//iocounters
					datas = io.toString().match(/\d+/g);
					if(datas){
						ends += datas[0]+'|'+datas[1]+'|'+datas[4]+'|'+datas[5]+'|';
					}
					else{
						ends += '||||';
					}
				//CPUPERCENT
					ends += cpuPercent+'|';
				//statinfo
					
					datas = prostat.toString().match(/\s*-?\d+\s/g);
					for(var y =0;y<datas.length;y++){
						datas[y] = datas[y].replace(/\s|\n/g,'');
					}
					var cputime = Number(datas[11])+Number(datas[12])+Number(datas[13])+Number(datas[14]);
					ends += processNice+'|';
					ends += cputime+'\n';
					}
					resolve(ends);
				});
			})
		},function(){
			//err control
		})
		.then(function(ends){
			return new Promise(function(resolve,reject){
				fs.writeFile('./logmanager/process.log',ends,function(err){
						if(err) throw err;
						console.log('process.log updateed');
						resolve();
					});
			})
		},function(){})
	}else{
		setProcesslog();
		Promise.resolve();
	}
},function(){});