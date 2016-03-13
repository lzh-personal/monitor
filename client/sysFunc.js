/*
系统函数模块，提供系统所需要的函数封装
*/
var   datas = require('./dataCollector/dataStructure.js'),
	fs = require('fs'),
	task = require('./configSys.json');
/*decline two 
*/
exports.decline = function(num,n){
	return typeof num==='Number' ? Math.round(num*Math.pow(10,n))/Math.pow(10,n) : 
	isNaN(Number(num)) ? (function(){throw "cant translate "+num+" into num";return NaN})(): 
	Math.round(Number(num)*Math.pow(10,n))/Math.pow(10,n);
}
/*
验证日志文件是否为开机后第一次跟新，若是调用callback(1),否则调用callback(0),若没有该文件，则调用init()初始化该日志文件
*/
exports.timeControl = function(path,callback){
	fs.readFile('/proc/uptime',function(err,data){
		if(err) throw err;
		var now = data.toString().match(/\d+\.\d+/i);
		now = (new Date()).getTime() - 1000*Number(now.splice(0,1));
		fs.readFile(path,function(err,data){
		try{
			var logTime = parseInt(data.toString().match(/last_update_time:(\d+)/i)[1]);
			if(logTime - now > 0){
				callback(1);
			}else{
				callback(0);
			}
		}catch(e){
			//callback(0);	
			throw e.message;
			}
			});
	});
}
exports.tasks = function(name,callback){
	var logsTask = typeof name === "string"?task[name]:name,
		endTasks = [],
		/*  任务执行迭代器  */
		runTasks = function*(endTasks){
				for(var x=0;x<endTasks.length;x++){
					if(endTasks[x]){
						//此rank层有需要执行的任务
						var subTasks = [];
						//执行所有此rank层任务
						endTasks[x].forEach(function(v){
							subTasks.push(require(v.require)[v.end]);
						});
						!rec&&(rec = reciver(subTasks));
						rec.next(subTasks);
						//执行了此rank层所有任务后暂停，不在启用其他rank层的任务
						yield subTasks;
					}	
				}
			},
		/*   任务回收迭代器，在所有子任务执行完成后开启下一次任务执行的迭代  */
		reciver = function*(subTasks){
			while(1){
				if(subTasks){
					Promise.all(subTasks).then(function(value){
						//console.log(run.next());
						//console.log(run);
						run.next().value;
						console.log('this turn subTasks finished!');
					},function(value){
						console.log("error:"+value);
					});
					subTasks = yield true;
				}else{
					yield false;
				}
			}
		}
	;

	//初始化任务数组为一个二维数组
	logsTask.forEach(function(v){
		v.rank = isNaN(+v.rank)?0:+v.rank;
		endTasks[v.rank] = endTasks[v.rank]||new Array();
		endTasks[v.rank].push(v);
	});
	console.log(endTasks);
	/*
	run 和 rec两个迭代其相互嵌套，要想运行其中的一个，都需要初始化两个迭代器
	但是rec迭代器需要run执行之后的输入
	*/
	var run = runTasks(endTasks);
	var rec;
	//开始迭代执行任务
	run.next();
}	
/*
错误处理函数，将捕获到的错误进行处理
*/
exports.errorHandler = function(reason){
	//personly error message
	var errorMessage = {
		ECONNREFUSED:"can not connect the target server,plaese check if your server is running or your network  connection is correct",
		NORMAL:"normal error,this happened  probablely beacuse some bugs in program",
	};
	var errorInfo="-----------------------------------------------------------------\n";
	var options = {
		year:'numeric',
		month:'numeric',
		day:'numeric',
		hour:'numeric',
		minute:'numeric',
		second:'numeric'
	}
	if(reason && typeof reason.subType==='number'){
		//自定错误类型
		switch (reason.subType){
			case 0x0001:
			//日志自动更新出现错误
			break;
			case 0x0002:
			//tcp客户端连接错误
			new Promise(function(resovle,reject){
				fs.open('./error.log','r+',function(err,fd){
					if(err) reject(err);
					resovle(fd);
				});
			})
			.then(function(fd){
				return new Promise(function(resovle,reject){
					fs.readFile('./error.log',function(err,data){
						if(err) reject(err);
						try{
							data = data.toString();
							errorInfo += new Date().toLocaleDateString('en-US',options)+":"+errorMessage.ECONNREFUSED+"\n";
							errorInfo += reason.stack+"\n-----------------------------------------------------------------\n";
							data += errorInfo;
							resovle([data,fd]);
						}catch(e){
							reject(e);
						}
					});
				})
			},function(err){
				//problem
				//arguments.callee(err);
			})
			.then(function(value){
				datas = value[0];
				fd = value[1];
				fs.writeFile('./error.log',datas,function(err){
					if(err) arguments.callee(err);
					fs.closeSync(fd);
				});
			},function(err){
				arguments.callee(err);
			})
			break;
			default:
			//nothing
			break;
		}
	}else{
		//not the personly error
		new Promise(function(resovle,reject){
				fs.open('./error.log','r+',function(err,fd){
					if(err) reject(err);
					resovle(fd);
				});
			})
			.then(function(fd){
				return new Promise(function(resovle,reject){
					fs.readFile('./error.log',function(err,data){
						if(err) reject(err);
						try{
							data = data.toString();
							errorInfo += new Date().toLocaleDateString('en-US',options)+":"+errorMessage.NORMAL+"\n";
							errorInfo += reason.stack+"\n-----------------------------------------------------------------\n";
							data += errorInfo;
							resovle([data,fd]);
						}catch(e){
							reject(e);
						}
					});
				})
			},function(err){
				arguments.callee(err);
			})
			.then(function(value){
				datas = value[0];
				fd = value[1];
				fs.writeFile('./error.log',datas,function(err){
					if(err) arguments.callee(err);
					fs.closeSync(fd);
				});
			},function(err){
				arguments.callee(err);
			})
	}
}