var cpuPercentInfo = new Array();
var memPercentInfo = new Array();
var back = drawBack();
var sensorsInfo = new Array();
var groupControl = {};
var heartTime,lastSensorsListener,lastCpuListener;
var cpudata,percpudata;
function getData(){
$.get('/jobmaker',function(data){
	data = JSON.parse(data);
	data = data[0].data;
	cpudata = data.cpu;
	percpudata = data.percpu;
	//repaint
	$("#system").empty();
	$("#now").empty();
	$("#uptime").empty();
	$("#cpuinfo").empty();
	$("#meminfo").empty();
	$("#sensorsinfo").empty();
	$("#disk").empty();
	$("#fs").empty();
	$("#swap").empty();
	$("#net").empty();
	$("#bottom").empty();
	//header
	console.log(data);
	/*
	var content = "";
	content += "<span class='title'>"+data.system.hostname+"</span>";
	content += "<span class='cell'>"+'&nbsp('+data.system.linux_distro+'&nbsp/&nbsp'+data.system.os_version+")"+"</span>";
	$("#system").append(content);
	*/
	//now
	content = "";
	content += "<span class='title'>"+data.now+"</span>";
	$("#now").append(content);
	//uptime
	content = "";
	content += "<span class='title'>uptime:&nbsp&nbsp</span>";
	content += "<span class='cell'>"+data.uptime+"</span>";
	$("#uptime").append(content);
	//cpu
	for(var x in data.cpu){
		data.cpu[x] = decimal(data.cpu[x],2);
	}
	try{
		cpuPercentInfo[0].unshift(decimal(1-data.cpu.idle,2));
		if(cpuPercentInfo[0].length > 26){
		cpuPercentInfo[0].shift();
		}
	}catch(e){
		cpuPercentInfo[0] = new Array();
		cpuPercentInfo[0].unshift(decimal(1-data.cpu.idle,2));
	}
	//use cpupercent
	for(var x = 1;x<=data.percpu.length;x++){
		try{
			cpuPercentInfo[x].unshift(decimal(1-data.percpu[x-1].idle,2));
			if(cpuPercentInfo[x].length > 26){
				cpuPercentInfo[x].shift();
			}
		}catch(e){
		cpuPercentInfo[x] = new Array();
		cpuPercentInfo[x].unshift(decimal(1-data.percpu[x-1].idle,2));
		}
	}
	var content = "";
	content += "<li><span class='title'>cpuInfo</span>";
	content += "<ul><a class='title cpugroup' onclick='choose(event)'>cpu</a></ul>";
	for(var x = 0;x<data.percpu.length;x++){
		content += "<ul><a class='title cpugroup' onclick='choose(event)'>logcpu"+x+"</a></ul>"
	}
	content += "</li>";
	$("#cpuinfo").append(content);
	if(groupControl.cpuLast === undefined){
		groupControl.cpuLast  = 0;
	}
	$("#cpuinfo a").get(groupControl.cpuLast).className += " choosed";
	//cpuleft
	var cpuleft = document.getElementById('cpucanvas');
	var cpuleftCtx = getCtx2d(cpuleft);
	clear(cpuleft,cpuleftCtx);
	back(cpuleft,cpuleftCtx);
	//cpuPercentInfo.push(data.cpu.percent);
	drawPercent(cpuleft,cpuleftCtx,cpuPercentInfo[groupControl.cpuLast]);
	if(lastCpuListener){
		cpuleft.removeEventListener('mousemove',lastCpuListener,false);
	}
	lastCpuListener = listener(cpuleft,cpuleftCtx,cpuPercentInfo[groupControl.cpuLast]);
	//cpuright
	var cpuright = document.getElementById('cpuright');
	var cpurightCtx = getCtx2d(cpuright);
	clear(cpuright,cpurightCtx);
	if(groupControl.cpuLast === 0){
		drawpie(cpuright,cpurightCtx,data.cpu,75);
	}else{
		drawpie(cpuright,cpurightCtx,data.percpu[groupControl.cpuLast-1],75);
	}
	//mem
	content = "";
	content += "<li><span class = 'title'>MemInfo</span><ul><span class='title'>used:</span><span class='cell'>"+data.mem.used+"</span></ul>";
	content += "<ul><span class='title'>available:</span><span class='cell'>"+data.mem.available+"</span></ul>";
	content += "<ul><span class='title'>buffers:</span><span class='cell'>"+data.mem.buffers+"</span></ul>";
	content +="<ul><span class='title'>cached:</span><span class='cell'>"+data.mem.cached+"</span></ul>";
	content +="<ul><span class='title'>active:</span><span class='cell'>"+data.mem.active+"</span></ul>";
	content += "<ul><span class='title'>inactive:</span><span class='cell'>"+data.mem.inactive+"</span></ul>";
	content +="</li>";
	$("#meminfo").append(content);
	//memcanvas
	var mem = document.getElementById('memcanvas');
	var memCtx = getCtx2d(mem);
	clear(mem,memCtx);
	back(mem,memCtx);
	memPercentInfo.unshift(decimal(data.mem.percent/100,2));
	drawPercent(mem,memCtx,memPercentInfo);
	if(memPercentInfo.length > 26)
		memPercentInfo.shift();
	//sensors info
	content = "";
	content +="<li><span class='title'>SensorsInfo</span>";
	//content +="<ul><a class='cell choosed sensorsgroup' onclick='choose(event)'>"+data.sensors[0].label+"</a></ul>";
	for(var x = 0;x<data.sensors.length;x++){
		content +="<ul><a class='cell sensorsgroup' onclick='choose(event)'>"+data.sensors[x].label+"</a></ul>";
	}
	content +="</li>";
	$("#sensorsinfo").append(content);
	if(groupControl.sensorsLast === undefined){
		groupControl.sensorsLast = 0;
	}
		$("#sensorsinfo a").get(groupControl.sensorsLast).className += " choosed";
	
	//sensors canvas
	for(var x = 0;x<data.sensors.length;x++){
		try{
			sensorsInfo[x].push(data.sensors[x].value);
		}catch(e){
			sensorsInfo[x] = new Array();
			sensorsInfo[x].push(data.sensors[x].value);
		}
	}
	var sensor = document.getElementById('sensorscanvas');
	var sensorCtx = getCtx2d(sensor);
	clear(sensor,sensorCtx);
	back(sensor,sensorCtx);
	for(var x = 0 ;x<sensorsInfo.length;x++){
			sensorsInfo[x][sensorsInfo[0].length-1] = decimal(sensorsInfo[x][sensorsInfo[0].length-1]/100,2);
		
	}
	drawPercent(sensor,sensorCtx,sensorsInfo[groupControl.sensorsLast]);
	if(lastSensorsListener){
		sensor.removeEventListener('mousemove',lastSensorsListener,false);
	}
	lastSensorsListener = listener(sensor,sensorCtx,sensorsInfo[groupControl.sensorsLast]);
	//disk
	/*
	content = "";
	content += "<span class='title head'>DISK</br></span>";
	content += "<table><thead><tr class='title'><td>read_byte</td><td>write_byte</td><td>disk_name</td></tr></thead><tbody>";
	for(var x = 0;x<data.diskio.length;x++){
		content += "<tr class='cell'><td>"+data.diskio[x].read_byte+"</td><td>"+data.diskio[x].write_byte+"</td><td>"+data.diskio[x].disk_name+"</td></tr>";
	}
	content +="</tbody></table>";
	$("#disk").append(content);
	*/
	//fs
	content = "";
	content += "<span class='title head'>FS</br></span>";
	content += "<table><thead><tr class='title'><td>device_name</td><td>fs_type</td><td>size</td><td>used</td><td>percent</td><td>mnt_point</td></tr></thead><tbody>";
	for(var x = 0;x<data.fs.length;x++){
		content += "<tr class='cell'><td>"+data.fs[x].device_name+"</td><td>"+data.fs[x].fs_type+"</td><td>"+data.fs[x].size+"</td><td>"+data.fs[x].used+"</td><td>"+data.fs[x].mnt_point+"</td><td>"+decimal(data.fs[x].percent,2)+"</td></tr>";
	}
	content +="</tbody></table>";
	$("#fs").append(content);
	//swap
	content  = "";
	content += "<span class='title'>MEMswap</br></span><table>";
	for(var x in data.memswap){
		content += "<tr class='title'><td>"+x+"</td><td class='cell'>"+data.memswap[x]+"</td></tr>";
	}
	content += "</table>";
	$("#swap").append(content);
	//net
	content = "";
	content +="<span class='title'>Net</br></span>";
	content +="<table><thead><tr class='title'><td>interface_name</td><td>rx</td><td>tx</td><td>cumulative_rx</td><td>cumulative_tx</td></tr></thead><tbody>";
	for(var x = 0;x<data.network.length;x++){
		content += "<tr class='cell'><td>"+data.network[x].interface_name+"</td><td>"+data.network[x].rx+"</td><td>"+data.network[x].tx+"</td><td>"+data.network[x].cumulative_rx+"</td><td>"+data.network[x].cumulative_tx+"</td></tr>";
	}
	content += "</tbody></table>";
	$("#net").append(content); 
	//processlist order by mempercent
	for(var x = 0;x<data.processlist.length;x++){
		for(var y = x+1;y<data.processlist.length;y++){
			if(data.processlist[y].mem_percent>data.processlist[x].mem_percent){
				var mid = data.processlist[x];
				data.processlist[x] = data.processlist[y];
				data.processlist[y] = mid;
			}
		}
	}
	var listarray = data.processlist.slice(0,20);
	content = "";
	content += "<span class='title'>ProcessList</span>";
	content +="<table><thead><tr class='title'><td>pid</td><td>name</td><td>status</td><td>username</td><td>Threads</td><td>cpu_percent</td><td>nice</td><td>mem_percent</td><td>cmd_line</td></tr></thead><tbody>";
	for(var x = 0;x<listarray.length;x++){
		content += "<tr class='cell'><td>"+listarray[x].pid+"</td><td>"+listarray[x].name+"</td><td>";
		content += listarray[x].status+"</td><td>"+listarray[x].username+"</td><td>"+listarray[x].Threads+"</td><td>";
		content += listarray[x].cpu_percent+"</td><td>"+listarray[x].nice+"</td><td>"+listarray[x].mem_percent;
		content += "</td><td>"+listarray[x].cmdline+"</td></tr>";
	}
	content += "</tbody></table>";
	$("#bottom").append(content);
});
heartTime = setTimeout(getData,1000);
}

$(document).ready(function(){
	getData();
	//Event handle
	var cpuleft = document.getElementById('cpucanvas');
	var cpuleftCtx = getCtx2d(cpuleft);
	var mem = document.getElementById('memcanvas');
	var memCtx = getCtx2d(mem);
	var sensor = document.getElementById('sensorscanvas');
	var sensorCtx = getCtx2d(sensor);
	$(document).click(function(e){
	if(heartTime){
		clearTimeout(heartTime);
		heartTime = null;
	}
	else{
		heartTime = setTimeout(getData,1000);
	}
});
	//mousemove listener
	listener(mem,memCtx,memPercentInfo);
	
	//group click listener
});
