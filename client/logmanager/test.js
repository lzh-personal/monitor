/*var filename = './logmanager/stat.log';
var crypto = require('crypto');
var fs = require('fs');

var shasum = crypto.createHash('sha1').update("aasdqs",'utf8').digest('base64');
console.log(shasum);

var s = fs.ReadStream(filename);
var stream,result;
var cipher = crypto.createCipher('AES-128-CBC-HMAC-SHA1',shasum);
var dis = crypto.createDecipher('AES-128-CBC-HMAC-SHA1',shasum);
s.on('data',function(d){
	cipher.update(d);
	dis.update(result);
});
s.on('end',function(){
	result = cipher.final('base64');
	console.log(result);
	
	
	console.log(dis.final('base64'));
})
*/
var x = 0;
while(1){
	++x;
}