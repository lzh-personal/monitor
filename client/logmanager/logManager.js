//logmanager作为数据收集部分的子进程使用
var fs = require('fs'),
	tasks = require('../configSys.json').logManager,
	sysFun = require("../sysFunc.js"),
	argv = global.process.argv.splice(2);
if(argv&&!argv[0]){
	sysFun.tasks("logManager",function(){
		console.log('final log updated');
	});
}else{
	var stat,process;
	for(var x=tasks.length-1;x>=0;x--){
		if(tasks[x].require.match(/statlog.js$/)){
			stat = x;
		}
		if(tasks[x].require.match(/processlog.js$/)){
			process = x;
		}
		if(stat && process){
			tasks[process].rank = tasks[stat].rank+1;
			break;
		}
	}
	
	sysFun.tasks(tasks,function(){
		console.log('final log updated');
	});
}
//file rwrite Lock
/*
fs.readFile('./configSys.json',function(err,data){
	if(err) throw err;
	var logsTask = JSON.parse(data).logManager,
	      endTasks = [];
	for(var x of logsTask){
		endTasks.push(require(x.require)[x.end]);
	}
	Promise.all(endTasks).then(function(value){
		console.log('logs updated');
	},function(value){
		console.log(value);
	})
});
*/