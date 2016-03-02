//logmanager作为数据收集部分的子进程使用
var fs = require('fs'),
	sysFun = require("../sysFunc.js");
sysFun.tasks("logManager",function(){
	console.log('final log updated');
})
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