var fs = require('fs'),
      childP = require('child_process'),
      dataStructure = require('./dataStructure.js'),
      sysFunc = require('../sysFunc.js'); 
//
var sensorsInfo = new Promise(function(resolve,reject){
	childP.exec('sensors',function(err,stdout){
		if(err){
			reject(err);
		}else{
			resolve(stdout.toString());
		}
	});
}).then(function(stdout){
	try{
		dataStructure.status.sensors = [];
		var temp = stdout.toString().match(/temp1\s*?:\s*?\+(\d+?\.\d+?)/);
		dataStructure.status.sensors[0] = {};
		dataStructure.status.sensors[0].type = 'temperature_core';
		dataStructure.status.sensors[0].value = Number(temp[1]);
		dataStructure.status.sensors[0].label = 'temp1';
		var core = stdout.toString().match(/[Cc]ore\s*?\d+?:\s*?\+(\d+?\.\d+?)/g);
		for(var x =0 ;x<core.length;x++){
			var name = core[x].match(/[Cc]ore\s*?\d+?/);
			var value = core[x].match(/\d+?\.\d+?/);
			dataStructure.status.sensors[x+1] = {};
			dataStructure.status.sensors[x+1].type = 'temperature_core';
			dataStructure.status.sensors[x+1].value = Number(value[0]);
			dataStructure.status.sensors[x+1].label = name[0];
		}
		return new Promise(function(resolve,reject){
			resolve();
		});
	}catch(e){
		throw e;
	}
},function(err){
	//err control
	throw err;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
})
// uptime
var uptimeInfo = new Promise(function(resolve,reject){
	fs.readFile('/proc/uptime',function(err,data){
		if(err){
			reject(err);
		}else{
			resolve(data.toString());
		}
	});
})
.then(function(data){
	try{
		var uptime = data.slice(0,data.indexOf(' '));
		if(Number(uptime)/3600 > 24){
			uptime = Math.floor(Number(uptime)/3600/24)+'day'+Math.floor(Number(uptime)/3600)-Math.floor(Number(uptime)/3600/24)+'hours';
		}else{
			uptime = Math.round(Number(uptime)/3600)+' hours';
		}
		var myDate = new Date();
		dataStructure.status.now = myDate.getFullYear()+'-'+(myDate.getMonth()+1)+'-'+myDate.getDate()+'  '+myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds();
		return Promise.resolve();
	}catch(e){
		throw e;
	}
},function(err){
	throw err;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
});

//vm
var vmstatInfo = new Promise(function(resolve,reject){
	childP.exec('vmstat',function(err,stdout){
		if(err) {
			reject(err);
		}else{
			resolve(stdout.toString());
		}
	});
})
.then(function(stdout){
	try{
		var data = stdout.match(/(\b\d+\b)/g);
		if(!dataStructure.status.memswap)
			dataStructure.status.memswap = {};
		dataStructure.status.memswap.sin = Number(data[5]);
		dataStructure.status.memswap.sout = Number(data[6]);
		return Promise.resolve();
	}catch(e){throw e}
},function(err){
	throw err.message;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
})

//core INfo
var coreInfo = new Promise(function(resolve,reject){
	fs.readFile('/proc/cpuinfo',function(err,data){
		if(err){
			reject(err);
		}else{
			resolve(data.toString());
		}
	});
})
.then(function(data){
	try{
		if(!dataStructure.status.core){
			dataStructure.status.core = {};
		}
		var cpucore = data.match(/core\s*?id\s*?:\s*(\d*)/g);
		cpucore = cpucore.map(function(x){
			x = x.match(/\d+/);
			return x[0];
		});
		var flag;
		dataStructure.status.core['log'] = cpucore.length;
		for(var x = 1;x<cpucore.length;x++){
			flag = 0;
			for(var y=0;y<x;y++){
				if(cpucore[y] === cpucore[x]){
					flag = 1;
				}
			}
			if(flag === 1){
				cpucore.splice(x,1);
			}
		}
		dataStructure.status.core['phys'] = cpucore.length;
		return Promise.resolve();
	}catch(e){throw e}
},function(err){
	throw err;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
});
// net info 
var netInfo = new Promise(function(resolve,reject){
	fs.readFile('logmanager/net.log',function(err,data){
	if(err){
		reject(err);
	}else{
		resolve(data.toString());
	}
	});
})
.then(function(data){
	try{
		var nets = data.match(/net_.*/g);
		if(!dataStructure.status.network)
			dataStructure.status.network = new Array();
		var time = data.match(/last_update_time:(\d+)/);
		var myDate = new Date();
		for(var x = 0;x<nets.length;x++){
			var name = nets[x].match(/_\w+/);
			name = name[0].replace(/_/,'');
			dataStructure.status.network[x] = {};
			dataStructure.status.network[x].interface_name = name;
			var netdata = nets[x].replace(/[a-zA-Z0-9_]+:/,'');
			netdata = netdata.split(',');
			dataStructure.status.network[x].rx = Number(netdata[0]);
			dataStructure.status.network[x].tx = Number(netdata[1]);
			dataStructure.status.network[x].cx = Number(netdata[0])+Number(netdata[1]);
			dataStructure.status.network[x].cumulative_rx = Number(netdata[2]);
			dataStructure.status.network[x].cumulative_tx = Number(netdata[3]);
			dataStructure.status.network[x].cumulative_cx = Number(netdata[2])+Number(netdata[3]);
			//time_since_update log`s net update time
			dataStructure.status.network[x].time_since_update = Number(myDate.getTime()) - Number(time[1]);
	}
	}catch(e){throw e}
},function(err){
	throw err;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
});

//disk info
var diskInfo = new Promise(function(resolve,reject){
	fs.readFile('logmanager/disk.log',function(err,data){
		if(err){
			reject(err);
		}else{
			resolve(data.toString());
		}
	});
})
.then(function(data){
	try{
		var disks = data.match(/.*\n/g);
		var time = data.match(/last_update_time:\d+/);
		var myDate = new Date();
		time = time[0].toString().match(/\d+/);
		if(!dataStructure.status.diskio)
			dataStructure.status.diskio = new Array();
		for(var x = 1;x<disks.length;x++){
			var nums = disks[x].match(/\b\d+(?:\.\d+)?\b/g);
			var name = disks[x].match(/[sh]d[a-z]\d*/);
			dataStructure.status.diskio[x-1] = {};
			dataStructure.status.diskio[x-1].time_since_update = myDate.getTime()-Number(time);
			dataStructure.status.diskio[x-1].read_byte = Number(nums[4]);
			dataStructure.status.diskio[x-1].write_byte = Number(nums[5]);
			dataStructure.status.diskio[x-1].read_time = Number(nums[6]);
			dataStructure.status.diskio[x-1].write_time = Number(nums[7]);
			dataStructure.status.diskio[x-1].disk_name = name[0];
		}
	}catch(e){throw e}
},function(err){
	throw err;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
});

//fs
var fsInfo = new Promise(function(resolve,reject){
	childP.exec('df -lT',function(err,stdout){
		if(err){
			reject(err);
		}else{
			resolve(stdout.toString());
		}
	});
})
.then(function(stdout){
	try{
		var datas = stdout.match(/.*\n/g);
		datas = datas.splice(1);
		if(!dataStructure.status.fs)
			dataStructure.status.fs = new Array();
		//console.log(datas);
		for(var x=0;x<datas.length;x++){
			var line = datas[x].toString().match(/[a-zA-Z0-9\/\.]+/g);
			dataStructure.status.fs[x] = {};
			dataStructure.status.fs[x].device_name = line[0];
			dataStructure.status.fs[x].fs_type = line[1];
			dataStructure.status.fs[x].size = Number(line[2]);
			dataStructure.status.fs[x].used = Number(line[3]);
			dataStructure.status.fs[x].mnt_point = line[6];
			dataStructure.status.fs[x].percent = Number(line[3])/Number(line[2]);
		}
	}catch(e){throw e}
},function(err){
	throw err;
})
.catch(function(reason){
	sysFunc.errorHandler(reason);
})
exports.sysInfo = Promise.all([sensorsInfo,uptimeInfo,vmstatInfo,coreInfo,netInfo,diskInfo,fsInfo]).then(function(){
	return Promise.resolve();
},function(value){
	console.log("reject");
	sysFunc.errorHandler(value);
})