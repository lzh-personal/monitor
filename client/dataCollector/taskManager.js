var express = require("express"),
      fs = require('fs'),
      childP = require('child_process'),
      datas = require('./dataStructure.js'),
      funcs = require('../sysFunc.js');
//核心任务加载
fs.readFile('./configSys.json',function(err,data){
	if(err) throw err;
	//开启所有已经注册的任务
	var starts = JSON.parse(data.toString()).tasks,
	      taskEndArr = [];
	//根据配置文件引入监控模块
	for(var x of starts){
		taskEndArr.push(require(x.require)[x.end]);
	}
	Promise.all(taskEndArr).then(function(value){
		try{
		//console.log("OK");
		//对所有进程按CPU使用率和内存占用率进行排序
		//console.log(datas.status.processlist);
		var processList = datas.status.processlist,
		       len = processList.length;
		for(var x=0;x<len;x++){
			for(var y=x+1;y<len;y++){
				if(processList[x].cpu_percent*processList[x].mem_percent<processList[y].cpu_percent*processList[y].mem_percent){
					var mid = processList[x];
					processList[x] = processList[y];
					processList[y] = mid;
				}
			}
		}
		datas.status.processlist = processList.slice(0,20);
		console.log(JSON.stringify(datas.status));
		}catch(e){
			console.log(e.stack);
		}
	},function(){
		console.log("as");
	})
});


