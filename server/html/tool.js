function getCtx2d (canvas) {
	if(canvas.getContext){
		var ctx = canvas.getContext('2d');
		return ctx;	
	}else{
		console.log('not support canvas');
		return;
	}
}
function clear(canvas,ctx){
	//chong hui 
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0,canvas.width,canvas.height);
}
function drawBack(){
	var n = 0;
	return function(canvas,ctx){
		var widthN = Math.floor(canvas.width-20/50);
		var heightN = Math.floor(canvas.height-20/50);
		var move = 50/2;
		//shu xian
		ctx.fillStyle = "rgb(0,255,125)";	
		for(var x = 0;x<widthN;x++){
			ctx.fillRect(n*move+50*x-1,0,1,canvas.height);
		}
		//heng xian 
		for(var x = 0;x<heightN;x++){
			ctx.fillRect(0,50*x,canvas.width,1);
		}
		n++;
		if(n >= 2){
			n = 0;
		}
	};
}
function drawPercent(canvas,ctx,percentList){
	var move = 50/2;
	var points = percentList.map(function(value){return canvas.height*(1-value);});
	//console.log(points);
	for(var x = 0;x<points.length;x++){
		ctx.beginPath();
		ctx.arc(move*x,points[x],3,0,Math.PI*2,true);
		ctx.fillStyle = "rgba(255,255,255,0.7)";
		ctx.closePath();
		ctx.fill();
		if(x>0){
			ctx.moveTo(move*x,points[x]);
			ctx.lineTo(move*(x-1),points[x-1]);
			ctx.strokeStyle = "rgb(125,125,125)";
			ctx.stroke();
		}
	}

}

function listener(canvas,ctx,percentList){
	var move = 50/2;
	var sulution = function(e){
	var points = new Array();
	for(var i = 0;i<percentList.length;i++){
		points.push(canvas.height*(1-percentList[i]));
	}
	var bbox = canvas.getBoundingClientRect();
	var x = e.pageX - canvas.offsetLeft*(canvas.width/bbox.width);
	var y = e.pageY - canvas.offsetTop*(canvas.height/bbox.height);
	for(var n = 0;n<points.length;n++){
		if(x < move*n+6 && x > move*n -6 && y < points[n]+6 && y > points[n] -6){
			ctx.font = "5px";
			ctx.textAlign = 'left';
			ctx.fillStyle = "#fff";
			ctx.fillText(percentList[n],move*n,points[n]-10);
		}else{
			//repaint question
			ctx.font = "5px";
			ctx.textAlign = 'left';
			ctx.fillStyle = "#000";
			ctx.fillText(percentList[n],move*n,points[n]-10);

		}
	}
}
	canvas.addEventListener('mousemove',sulution,false);
	return sulution;
}
function drawpie(canvas,ctx,obj,size){
	var colorChoose = ['#f60','#fc3','#669','#066','#99f','#cc6','#06f','c30','#390','#99c','#060'];
	var total = 0;
	var lastEndAngle = 0;
	var eachAngle = 0;
	var colorset = 0;
	for(var x in obj){
		if(isNaN(obj[x])){
			console.log(obj[x]+"is NaN");
		}else{
			total += Number(obj[x]);
		}
	}
	for(var y in obj){
		eachAngle = Math.PI*2*obj[y]/total;
		//console.log(eachAngle);
		//if(eachAngle > 1/24*Math.PI*2){//da yu 15du
			//set color and count
			if(colorset > 10)
				colorset = 0;
			//draw pie
			ctx.beginPath();
			//ctx.moveTo(canvas.width/2,canvas.height/2);
			//ctx.lineTo(canvas.width/2+canvas.width/2*size*Math.cos(lastEndAngle),canvas.height/2-canvas.height/2*size*Math.sin(lastEndAngle));
			ctx.arc(canvas.width/2,canvas.height/2,size,lastEndAngle,lastEndAngle+eachAngle,false);
			ctx.lineTo(canvas.width/2,canvas.height/2);
			ctx.closePath();
			ctx.fillStyle = colorChoose[colorset];
			ctx.fill();
			//draw describe
			ctx.fillStyle = colorChoose[colorset];
			ctx.fillRect(10,10+colorset*20,10,10);
			ctx.font = "5px";
			ctx.textAlign = 'left';
			ctx.fillStyle = "#fff";
			ctx.fillText(y+" : "+percent(obj[y]),28,18+colorset*20);
		/*}else{
			//draw describe
			console.log(colorset);
			ctx.fillStyle = colorChoose[colorset];
			ctx.fillRect(10,10+colorset*20,10,10);
			ctx.font = "5px";
			ctx.textAlign = 'left';
			ctx.fillStyle = "#fff";
			ctx.fillText(y+" : "+percent(obj[y]),28,18+colorset*20);
			//draw pie
			ctx.beginPath();
	
		}*/
		//ready for next draw
			lastEndAngle += eachAngle;
			colorset++;

	}

}
function decimal(num,count){
	return Math.round(num*Math.pow(10,count))/Math.pow(10,count);	
}
function percent(num){
	return decimal(num*100,2)+'%';
}
function choose(e){
		e.stopPropagation();
		if(e.target.className.indexOf('choosed') < 0){
			var groupName = e.target.className.match(/\s*(\w*)group/);
			groupName = groupName[1];
			var group = $('.'+groupName+'group');
			for(var x = 0;x<group.length;x++){
				if(group[x].className.indexOf('choosed') > 0){
					group[x].className = group[x].className.replace(/choosed/,'');
				}
			}
			e.target.className += " choosed";
			var alist = $("#"+groupName+"info a");
			for(var x = 0;x<alist.length;x++){
				if(alist[x].className.indexOf('choosed') > 0 ){
					groupControl[groupName+'Last'] = x;
				}
			}
			//repaint
			var canvas = $("#"+groupName+"canvas").get(0);
			var Ctx = getCtx2d(canvas);
			clear(canvas,Ctx);
			back(canvas,Ctx);
			switch(groupName){
				case "cpu":
					drawPercent(canvas,Ctx,cpuPercentInfo[groupControl.cpuLast]);
					var cpuright = document.getElementById('cpuright');
					var cpurightCtx = getCtx2d(cpuright);
					clear(cpuright,cpurightCtx);
					if(groupControl.cpuLast === 0){
						drawpie(cpuright,cpurightCtx,cpudata,75);
					}else{
						drawpie(cpuright,cpurightCtx,percpudata[groupControl.cpuLast-1],75);
					}
					break;
				case "sensors":
					drawPercent(canvas,Ctx,sensorsInfo[groupControl.sensorsLast]);
					break;
				default:
					break;
			}
		}
}

/*function errordrow(){
	var n = 0;
	return function(canvas,ctx){
		var widthN = Math.floor(canvas.width-20/50);
		var heightN = Math.floor(canvas.height-20/50);
		var move = 50/3;
		//chong hui 
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		//shu xian
		ctx.strokeStyle = "rgb(0,255,125)";	
		for(var x = 0;x<widthN;x++){
			ctx.moveTo(n*move+50*x,0);
			ctx.lineTo(n*move+50*x,canvas.height);
			ctx.stroke();
		}
		//heng xian 
		for(var x = 0;x<heightN;x++){
			ctx.moveTo(0,20+50*x);
			ctx.lineTo(canvas.width,20+50*x);
			ctx.stroke();
		}
		n++;
		if(n >= 3){
			n = 0;
		}
	};


}*/