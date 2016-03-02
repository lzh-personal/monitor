/**********************
options{
	maxAge:number ==> make the property removeable after maxAge times ltertation,default Infinity
}
*
**********************/
function objectManager(options){
	this.data = {};
	this.maxAge = options&&options.maxAge||Infinity;
	this.timeout = options&&options.timeout;//property timeout
	this.interval = options&&options.interval;//gc timeout
	this.keylist=[];
	this.maxSize = options&&options.maxSize||Infinity;
	this.size = 0;
	this.isTimeControl = options&&options.isTimeControl||(this.timeout&&this.interval)?true:false;
};
objectManager.prototype = {
	constructor:objectManager,
	set:function(key,value,isStatic){
		var data = this.data,
		      keylist = this.keylist;
		if (data[key]){
			//exist
			data[key].value=value;
			console.log(this.getList(key).gen.next(-1).value);
			keylist.push(keylist.splice(data[key].key,1)[0]);
		}else{
			if(this.size === this.maxSize){
				//dorp the earliest used property
				clearTimeout(keylist[0].interval);
				data[keylist[0].key] = null;
				delete data[keylist[0].key];
				keylist.shift();
				--this.size;
			}
			//not exist
			var gen = this.generator(0);
			keylist.push({
				key:key,
				gen:gen,
			});
			if(this.isTimeControl){
				keylist[keylist.length-1].interval =setInterval(function(){
					console.log(gen.next().value);
				},this.timeout);
			}
			data[key] = {
				value:value,
				key:keylist.length-1
			};
			!isStatic&&(++this.size);	
		}
	},
	get:function(key){
		//set the key property to Least Recently Used prop
		if(this.data[key]){
			this.getList(key).gen.next(-1);
			this.keylist.push(this.keylist.splice(this.data[key].key,1)[0]);
			return this.data[key].value;
		}else{
		//just return undefined if asking a removed property
			return undefined;
		}
	},
	generator:function*(i){
		while(true){
			var value = yield ++i;
			if(typeof value === 'number'){
				i=value;
			}
		}
	},
	startgc:function(){
		if(this.isTimeControl){
			var self = this;
			setInterval(function(){
				for(var x = self.keylist.length-1;x>=0;x--){
					//must do one more ltertation cause we cant get the current gen status
					//somehow,this will speed up the idle property`s diying
					var v = self.keylist[x].gen.next().value;
					console.log(v);
					if(v>= self.maxAge+1){
						//self.keylist[x].gen.return(0); not support
						clearTimeout(self.keylist[x].interval);
						self.data[self.keylist[x].key] = null;
						delete self.data[self.keylist[x].key];
						self.keylist.splice(x,1);
						//self.keylist[x] = null;
						//delete self.keylist[x];
					}
				}
				console.log(self.data);
			},this.interval);
		}
	},
	getList:function(key){
		//get the ele in keylist by this key
		return this.keylist[this.data[key].key];
	}
};
exports.objectManager = objectManager;
/*
//set property will reset the propertys generator test
var test = new objectManager({
	maxAge:20,
	timeout:1000,
	interval:20*1000,
	maxSize:3
});
test.set('key','value');
test.set('key2','value2');
test.startgc();
test.set('key3','value3');
test.set('key4','value4');
test.set('key5','value5');
console.log(test.get('key'));
console.log(test.data)
*/