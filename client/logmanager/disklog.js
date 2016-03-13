var fs = require('fs'),
      toolFunc = require('../sysFunc.js'),
      myDate = new Date();
var getBytes = function(num){
//使用读写扇区次数计算总的读写字节数，扇区的大小512bytes
	return 512*num;
}
/*+++++++++硬盘信息日志++++++++++++
line1:日志更新时间
文件系统分区名：读到的字节数(开机至更新时刻,bytes)，写的字节数，所有读操作花费的毫秒数，所有些操作花费的毫秒数（开机至更新时刻），更新时间间隔内读的字节数，更新时间间隔内写的字节数，更新时间间隔内读操作花费的毫秒数，更新时间间隔内写操作花费的毫秒数
++++++++++++++++++++++++++++++++*/
exports.diskInfo = new Promise(function(resolve,reject){
	fs.exists('./logmanager/disk.log',function(exists){
		if(!exists){
			return new Promise(function(resolve,reject){
				fs.open('./logmanager/disk.log','w+',function(err,fd){
				if(err) throw err;
				var datas =  'last_update_time:' + myDate.getTime()+'\n';
				resolve([datas,fd]);
			});
			})
			.then(function(value){
				var datas = value[0],
				      fd = value[1];
				fs.writeFile('./logmanager/disk.log',datas,function(err){
					if(err) throw err;
					console.log('disk.log is aready!');
					fs.closeSync(fd);
					toolFunc.timeControl('./logmanager/disk.log',resolve)
				});
			},function(){})
			
		}else{
		toolFunc.timeControl('./logmanager/disk.log',resolve);
		//resolve(0);
		}
	})
}).then(function(value){
	if(value === 1){
		return new Promise(function(resolve,reject){
			fs.readFile('/proc/diskstats',function(err,data){
				if(err) throw err;
				var datas = data.toString().match(/[hs]d[a-z]\d*.*\n/g);
				var names = new Array();
				var nums = new Array();
				var ends;
				ends = '';
				ends += 'last_update_time:'+myDate.getTime()+'\n';
				for(var x = 0;x<datas.length;x++){
					names[x] = datas[x].match(/[hs]d[a-z]\d*/g);
					nums[x] = datas[x].match(/\b\d+\b/g);
				}
				resolve([names,nums,ends,datas]);
			});
		})
		.then(function(value){
			var names = value[0],
			      nums = value[1],
			      ends = value[2],
			      datas = value[3];
			return new Promise(function(resolve,reject){
				fs.readFile('./logmanager/disk.log',function(err,data){
					if(err) throw err;
					for(var x = 0;x<datas.length;x++){
						var pattern = new RegExp(names[x]+'.*');
						var old = pattern.exec(data.toString());
						if(old){
							ends += names[x]+':';
							//如果不是新的硬件，也不是开机第一次运行，则计算更新时间间隔内的各项指标
							var oldnums = old.toString().match(/\b\d+(?:\.\d+)?\b/g);
							ends += getBytes(nums[x][2])+',';
							ends += getBytes(nums[x][6])+',';
							ends += nums[x][3]+',';
							ends += nums[x][7]+',';
							ends += getBytes(nums[x][2]) - oldnums[0]+',';
							ends += getBytes(nums[x][6]) - oldnums[1]+',';
							ends += nums[x][3] - oldnums[2]+',';
							ends += nums[x][7] - oldnums[3]+'\n';
						}else{
							ends += names[x]+':';
							//使用读写扇区次数计算总的读写字节数，扇区的大小512bytes
							//read bytes
							ends += getBytes(nums[x][2])+',';
							//write bytes
							ends += getBytes(nums[x][6])+',';
							//number of milliseconds spent reading
							ends += nums[x][3]+',';
							//number of milliseconds spent writing
							ends += nums[x][7]+'\n';
						}
					}
				resolve(ends);
				});
			})
		},function(){
			//err control
		})
		.then(function(ends){
			return new Promise(function(resolve,reject){
				fs.writeFile('./logmanager/disk.log',ends,function(){
					console.log('disk.log updated');
					resolve();
				});
			})
		},function(){
			//err control
		})
	}else if(value===0){
		fs.readFile('/proc/diskstats',function(err,data){
			if(err) throw err;
			var datas = data.toString().match(/[hs]d[a-z]\d*.*\n/g);
			var nums;
			var ends,name;
			ends = '';
			ends += 'last_update_time:'+myDate.getTime()+'\n';
			for(var x = 0;x<datas.length;x++){
				name = datas[x].match(/[hs]d[a-z]\d*/);
				nums = datas[x].match(/\b\d+\b/g);
				ends += name[0]+':';
				
				//read bytes
				ends += getBytes(nums[2])+',';
				//write bytes
				ends += getBytes(nums[6])+',';
				//number of milliseconds spent reading
				ends += nums[3]+',';
				//number of milliseconds spent writing
				ends += nums[7]+'\n';
			}
			fs.writeFile('./logmanager/disk.log',ends,function(err){
				if(err) throw err;
				console.log('disk.log saved');
				return new Promise(function(resolve,reject){
						resolve();
					})
			});
		});
	}
},function(){
	//err control
});