var fs = require('fs'),
      childP = require('child_process'),
      dataStructure = require('./dataStructure.js'),
      toolFunc = require('../sysFunc.js');
//CPU信息
var cpuInfo = new Promise(function(resolve,reject){
	fs.readFile('logmanager/stat.log',function(err,data){
		if(err){
			reject(err);
		}else{
			resolve(data.toString());
		}
	});
}).then(function(value){
	try{
		var cpudata = value.match(/cpu\d?Percent.*\n/g),
		      cpu = cpudata[0].toString().match(/\d+(\.\d+)?/g),
		      result = dataStructure.status;
		if(!result.cpu)
			result.cpu = {};
		result.cpu.user = toolFunc.decline(cpu[0],4);
		result.cpu.nice = toolFunc.decline(cpu[1],4);
		result.cpu.system = toolFunc.decline(cpu[2],4);
		result.cpu.idle = toolFunc.decline(cpu[3],4);
		result.cpu.iowait = toolFunc.decline(cpu[4],4);
		result.cpu.irq = toolFunc.decline(cpu[5],4);
		result.cpu.softirq = toolFunc.decline(cpu[6],4);
		result.cpu.steal = toolFunc.decline(cpu[7],4);
		result.cpu.guest = toolFunc.decline(cpu[8],4);
		result.cpu.guest_nice = toolFunc.decline(cpu[9],4);
		if(!result.percpu)
			result.percpu = [];
		for(var x =cpudata.length-1;x>=0;x--){
			result.percpu[x] = {};
			var percpu = cpudata[x].toString().match(/\b\d+(\.\d+)?\b/g);
			result.percpu[x].user = toolFunc.decline(percpu[0],4);
			result.percpu[x].nice = toolFunc.decline(percpu[1],4);
			result.percpu[x].system = toolFunc.decline(percpu[2],4);
			result.percpu[x].idle = toolFunc.decline(percpu[3],4);
			result.percpu[x].iowait = toolFunc.decline(percpu[4],4);
			result.percpu[x].irq = toolFunc.decline(percpu[5],4);
			result.percpu[x].softirq = toolFunc.decline(percpu[6],4);
			result.percpu[x].steal = toolFunc.decline(percpu[7],4);
			result.percpu[x].guest = toolFunc.decline(percpu[8],4);
			result.percpu[x].guest_nice = toolFunc.decline(percpu[9],4);

			
		}
		return new Promise(function(resolve,reject){
			resolve();
		})
	}catch(e){throw e}
},function(value){
	throw value;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
})
//内存信息
var memInfo = new Promise(function(resolve,reject){
	fs.readFile('/proc/meminfo',function(err,data){
		if(err){
			reject(err);
		}else{
			resolve(data.toString());
		}
	});
}).then(function(value){
	try{
		var percent,
		      result = dataStructure.status;
		if(!result.mem)
		result.mem = {};
	//mem con
		var memTotal = value.match(/[Mm]em[Tt]otal\s*?:\s*?(\d+)/);
		result.mem.total = Number(memTotal[1]);
		var free = value.match(/[Mm]em[Ff]ree\s*?:\s*?(\d+)/);
		result.mem.available = Number(free[1]);
		result.mem.free = Number(free[1]);
		var cached = value.match(/[Cc]ached\s*?:\s*?(\d+)/);
		result.mem.cached = Number(cached[1]);
		var inactive = value.match(/[Ii]nactive\s*?:\s*?(\d+)/);
		result.mem.inactive = Number(inactive[1]);
		var active = value.match(/[Aa]ctive\s*?:\s*?(\d+)/);
		result.mem.active = Number(active[1]);
		var buffers = value.match(/[Bb]uffers\s*?:\s*?(\d+)/);
		result.mem.buffers = Number(buffers[1]);
		result.mem.used = Number(memTotal[1])-Number(free[1]);

		percent = Number(memTotal[1]) ===0?0:result.mem.used/Number(memTotal[1])
		result.mem.percent = toolFunc.decline(percent,4);
		//memswap
		var total = value.match(/[Ss]wap[Tt]otal\s*?:\s*?(\d+?)/);
		if(!result.memswap)
			result.memswap = {};
		result.memswap.total = Number(total[1]);
		var free = value.match(/[Ss]wap[Ff]ree\s*?:\s*?(\d+?)/);
		result.memswap.free = Number(free[1]);
		result.memswap.used = total[1]-free[1];

		percent = result.memswap.total===0?0:result.memswap.used/result.memswap.total
		result.memswap.percent = toolFunc.decline(percent,4);
		
		return new Promise(function(resolve,reject){
			fs.readFile('logmanager/process.log',function(err,data){
				if(err){ 
					throw err;
				}else{
					resolve([data.toString(),value]);
				}
			});
		});
	}catch(e){throw e}
},function(value){
	throw value;
})
.then(function(value){
	try{
		//所有进程信息
		var processes = value[0].match(/.*\n/g),
		      mem = Number(value[1].match(/[Mm]em[Tt]otal\s*?:\s*?(\d+)/)[1]),
		      result = dataStructure.status;
		if(!result.processlist)
			result.processlist = [];
		if(!result.processcount)
			result.processcount = {};
			result.processcount.total = processes.length-1;
			result.processcount.threads = 0;
			//日志的第一行用于记录更新时间
		for(var x = 1;x<processes.length;x++){
			result.processlist[x-1] = {};
			processes[x-1] = processes[x].toString().replace(/\n/g,'');
			var datas = processes[x-1].toString().split('|');
			result.processlist[x-1].ioCounter = [];
			result.processlist[x-1].mem_info = [];
			result.processlist[x-1].pid = Number(datas[0]);
			result.processlist[x-1].name = datas[1];
			result.processlist[x-1].status = datas[2];
			result.processlist[x-1].username = datas[3];
			result.processlist[x-1].mem_info.push(Number(datas[4]));
			result.processlist[x-1].mem_info.push(Number(datas[5]));
			result.processlist[x-1].Threads = Number(datas[6]);
			result.processlist[x-1].cmdline = datas[7];
			result.processlist[x-1].ioCounter.push(Number(datas[8]));
			result.processlist[x-1].ioCounter.push(Number(datas[9]));
			result.processlist[x-1].ioCounter.push(Number(datas[10]));
			result.processlist[x-1].ioCounter.push(Number(datas[11]));
			result.processlist[x-1].cpu_percent = Number(datas[12]);
			result.processlist[x-1].nice = Number(datas[13]);
			result.processlist[x-1].mem_percent = Number(datas[4])/mem;
			//总线程数量
			result.processcount.threads += Number(datas[6]);
			switch(datas[2]){
				//睡眠状态的进程数量
				case 'S':
				case 'D':
					result.processcount.sleeping  ? result.processcount.sleeping++ : result.processcount.sleeping=1;
					break;
				//运行状态进程数量
				case 'R':
					result.processcount.running ? result.processcount.running++ : result.processcount.running=1;
					break;
				//暂停状态和跟踪状态进程数量
				case 'T':
					result.processcount.stopOrTraced ? result.processcount.stopOrTraced++ : result.processcount.stopOrTraced=1;
					break;
				//退出状态，僵尸进程数量
				case 'Z':
					result.processcount.stopOrTraced ? result.processcount.stopOrTraced++ : result.processcount.stopOrTraced=1;
					break;
				//退出状态，即将被销毁进程数量
				case 'X':
					result.processcount.exiting ? result.processcount.exiting++ : result.processcount.exiting=1;
					break;
			}
		}
		return Promise.resolve();
	}catch(e){throw e}
},function(v){
	throw v;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
})

//end
exports.mainStructEnd = Promise.all([cpuInfo,memInfo])
.then(function(){
	
	return Promise.resolve();
},function(value){
	console.log("reject");
	sysFunc.errorHandler(value);
	//err control
})