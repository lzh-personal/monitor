/*http服务器
此服务器监听8888端口，提供基础http服务
若请求是索要jobmaker.js，则构建TCP客户端并向物理主机索要json串
*/
var http = require("http");
var url =require("url");
var fs = require('fs');
var childP = require('child_process');
var net = require('net');
function startserver(){
	var server = http.createServer(function(request,response){
	var thisurl = url.parse(request.url);
	var fileName = thisurl.pathname.substring(1);
	var type;
	switch(fileName.substring(fileName.lastIndexOf('.')+1)){
		case 'html':
		case 'htm': type = 'text/html'; break;
		case 'js': type = 'application/javascript';break;
		case 'css': type = 'text/css';break;
		case 'txt': type = 'text/plain';break;
		case 'manifest': type = 'text/cache-manifest';break;
		default : type = 'application/octet-stream';break;
	}

		//deal with the ob request
	if(fileName === 'jobmaker.js'){
		//从配置文件中读取系统所监控的所有主机ip
		fs.readFile('config.con',function(err,data){
			if(err) {
				response.writeHead(404,{"Content-Type":"text/plain;charset = utf8"});
				response.write(err.message);
				response.end();
			}else{
				var jsonData = new Array(),n=0;
				var clients = new Array();
				var targetIp = data.toString().match(/target_address:([\d,\.]{1,})\n/);
				//test if all tcpclient is already closed
				targetIp = targetIp[1].split(',');
				var combina = function(ip){
					targetIp.forEach(function(v,i,a){(ip===v)&&a.splice(i,1)});
					clients.forEach(function(v,i,a){(ip===a[i].host)&&a.splice(i,1)});
					if(targetIp.length === 0){
						var ends = JSON.stringify(jsonData)
						response.writeHead(200,{"Content-Type":"text/plain;charset = utf8"});
						response.write(ends.toString());
						//console.log(jsonData['127.0.0.1'].toString());
						response.end();
					}
				};
				//console.log(targetIp);
				debugger;
				targetIp.forEach(function(value){
					//对应每个ip地址构建对应tcp客户端
					var client = {};
					var thisdata = '';
					client.host = value;
					client.connection = net.connect({port:8889,host:value},function(){
						client.connection.write('gmjd');
					});
					client.connection.on('data',function(data){
						console.log(data.toString());
						if(data.toString().match(/\^alldone\^/)){
							thisdata += data.toString();
							var jsonSubData = {};
							jsonSubData.ip = client.host;
							thisdata = thisdata.replace(/\\\"/g,"\"");
							thisdata = thisdata.replace(/\^alldone\^/,'');
							jsonSubData.data = JSON.parse(thisdata);
							jsonData.push(jsonSubData);
							n++;
							//console.log(jsonData[client.host].toString());
							client.connection.end();
							//combina(client.host);
						}else{
							thisdata += data.toString();
						}
						
					});
					client.connection.on('end',function(){
						combina(client.host);
						console.log("FIN");
					})
					clients.push(client);
				});
				//console.log(jsonData);
				//yibu client jianli ru he yu ip array tong bu 
					/*	response.writeHead(200,{"Content-Type":"text/plain;charset = utf8"});
						response.write(JSON.parse(jsonData));
						console.log(JSON.parse(jsonData));
						response.end();*/
					}
			});
		}else{
			fs.readFile(fileName,function(err,data){
			if(err) {
				response.writeHead(404,{"Content-Type":"text/plain;charset = utf8"});
				response.write(err.message);
				response.end();
			}
			else {
				response.writeHead(200,{"Content-Type":type,
					   "Content-Encoding":"utf8"	
					});
			response.write(data);
			response.end();
			}
		});
		}
	
		
	/*}else{
		var command = "node "+fileName;
		childP.exec(command,function(err,stdout){
			if(err) {
				response.writeHead(404,{"Content-Type":"text/plain;charset = utf8"});
				response.write(err.message);
				response.end();
			}
			else {
				response.writeHead(200,{"Content-Type":type,
					   "Content-Encoding":"utf8"	
				});
				response.write(stdout);
				response.end();
			}	
		});
		
	}*/
	}).listen(8888);
}
exports.startserver = startserver;
exports.get = function(thisurl,callback){
	if(!callback){
		return "callback function must have";
	}
	console.log(thisurl);
	var req = http.get(thisurl,callback);
	req.on('error',function(e){
		console.log('error:'+e.message);
	});
}
exports.post = function(thisurl,callback){
	console.log(thisurl);
	if(!callback){
		return "callback function must have";
	}
	var thisurl = url.parse(thisurl);
	var thishostname = thisurl.hostname;
	var thisport = thisurl.port || 80;
	var thispath = thisurl.pathname;
	var query = thisurl.query;
	if(query){
		path += "?"+query;
	}
	var options = {
		hostname : thishostname,
		port : thisport,
		path : thispath,
		method : 'POST'
	};
	var req = http.request(options,callback);
	req.on('error',function(e){
		console.log("error:"+e.message);
	});
	req.write('data\n');
	req.write('post request sended');
	req.end();
}
	

