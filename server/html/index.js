var CpuInfo = new Array();
var MemInfo = new Array();
var SensorsInfo = new Array();


setInterval('getData()',1000);

//functions
function getData(){
	$.get('/jobmaker',function(data){
		data = JSON.parse(data);
		//console.log(data);
		console.log(MemInfo);


		//wei hu dong tai xin xi 
		//cpu
		for(var x = 0;x<data.length;x++){
			CpuInfo[x] = new Array();
			//console.log(data[x]);
			try{
				CpuInfo[x][0].unshift(decimal(1-data[x].data.cpu.idle,2));
				if(CpuInfo[x][0].length > 26){
				CpuInfo[x][0].shift();
				}
			}catch(e){
				CpuInfo[x][0] = new Array();
				CpuInfo[x][0].unshift(decimal(1-data[x].data.cpu.idle,2));
			}
			//percpu
			for(var y = 1;y<=data[x].data.percpu.length;y++){
				try{
					CpuInfo[x][y].unshift(decimal(1-data[x].data.percpu[y-1].idle,2));
					if(CpuInfo[x][y].length > 26){
						CpuInfo[x][y].shift();
					}
				}catch(e){
				CpuInfo[x][y] = new Array();
				CpuInfo[x][y].unshift(decimal(1-data[x].data.percpu[y-1].idle,2));
				}
			}
		}
		//console.log(CpuInfo);
		//mem
		for(var x=0;x<data.length;x++){
			MemInfo[x] = new Array();
			MemInfo[x].unshift(decimal(data[x].data.mem.percent/100,2));
			if(MemInfo[x].length > 26)
		MemInfo[x].shift();
		}
		//console.log(MemInfo);
		//sensors
		for(var x=0;x<data.length;x++){
			SensorsInfo[x] = new Array();
			for(var y = 0;y<data[x].data.sensors.length;y++){
				try{
					SensorsInfo[x][y].push(data[x].data.sensors[y].value);
				}catch(e){
					SensorsInfo[x][y] = new Array();
					SensorsInfo[x][y].push(data[x].data.sensors[y].value);
				}
			}
		}
		//console.log(SensorsInfo);
		if(window.sessionStorage){
			window.sessionStorage.setItem('cpu',JSON.stringify(CpuInfo));
			window.sessionStorage.setItem('mem',JSON.stringify(MemInfo));
			window.sessionStorage.setItem('sensors',JSON.stringify(SensorsInfo));
		}else{
			alert('your browser dose not support Stroage');
		}
		//draw rect
		$('#centerbody').empty();
		var vector = rectangle(data.length);
		var n = 1;
		//console.log(vector);
		//console.log($('#centerbody').get(0).offsetWidth);
		//sheng yi bi li xi shu 
		var bodyHeight = vector[1]/(vector[1]+1)*$('#windowSize').get(0).offsetHeight;
		var bodyWidth = vector[0]/(vector[0]+1)*$('#windowSize').get(0).offsetWidth;
		$('#centerbody').css({
			'width':bodyWidth+'px',
			'height':bodyHeight+'px',
			'position':'relative',
			'top':($('#windowSize').get(0).offsetHeight-bodyHeight)/2+'px',
			'left':($('#windowSize').get(0).offsetWidth-bodyWidth)/2+'px'
		});
		for(var x=0;x<vector[0];x++){
			for(var y=0;y<vector[1];y++){
				var content = '<a class="rect" href="dp_status.html?n='+n+'&target='+data[n-1].ip+'"><span>'+data[n-1].ip+'</span></a>'
				$('#centerbody').append(content);
				if(n<data.length){
					n++;
				}else{
					break;
				}
			}
		}
		var divWidth =($('#centerbody').get(0).offsetWidth-vector[0]*20)/vector[0];
		var divHeight = ($('#centerbody').get(0).offsetHeight-vector[1]*20)/vector[1];
		$('.rect').css({
			'margin-right':'20px',
			'margin-bottom':'20px',
			'width':divWidth+'px',
			'height':divHeight+'px',
			'background-color':'#fff',
			'border-radius':divHeight/2+'px',
			'display':'inline-block',
			'text-align':'center'
		});
		
	});
}
//find best way to draw items,input totlenumber,output a [chang,kuan] for a rectangle
function rectangle(m){
	var hcol = Math.ceil(Math.sqrt(m));
	var hrow = Math.ceil(m/hcol);
	var lrow = Math.floor(Math.sqrt(m));
	var lcol = Math.ceil(m/lrow);
	//var h = [],l = [];
	//col go up,caculate h
	while(hcol/hrow < Math.sqrt(3)){
		hcol++;
		hrow = Math.ceil(m/hcol);
	}
	if(Math.abs(hcol*hrow - m) < Math.abs((hcol-1)*Math.ceil(m/(hcol-1))-m)){
		//h=[hcol,hrow];
		return [hcol,hrow];
	}else{
		//h=[hcol-1,Math.ceil(m/(hcol-1))];
		return [hcol-1,Math.ceil(m/(hcol-1))];
	}
	/*
	//row go down,caculate l
	while(lcol/lrow < Math.sqrt(3)){
		lrow--;
		lcol = Math.ceil(m/lrow);
	}
	if(lcol.lrow - Math.sqrt(3) >= Math.abs(Math.ceil(m/(lrow+1))/(lrow+1)-Math.sqrt(3))){
		l=[lcol,lrow];
	}else{
		l=[Math.ceil(m/(lrow+1)),lrow+1];
	}
	//combine l and h
	if(l[0]*l[1]-m > h[0]*h[1]-m){
		return h;
	}else{
		return l;
	}*/
	/*var h = function(){
		console.log('start');
		var dev = hcol/hrow;
		hcol++;
		hrow = Math.ceil(m/hcol);
		if(hcol/hrow > Math.sqrt(3)){
			if(Math.abs(dev-Math.sqrt(3)) >= hcol/hrow - Math.sqrt(3)){
				console.log(hrow);
				return [hcol,hrow];
			}else{
				//console.log(hcol);
				return [hcol-1,Math.ceil(m/(hcol-1))];
			}
		}else{
			console.log('ok');
			arguments.callee();
		}
	}();
	console.log(h);*/
}
