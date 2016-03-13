/*var promise = new Promise(function(resolve, reject) {
            resolve(mongo.merchant.findOne({
                id: merchantId
            }));
        });

        return promise.then((merchant) => {
             Promise.resolve(mongo.display.find({
                id: {
                    '$in': merchant.displays
                }
            }));
        });
*/
/*
function* anotherGenerator(i) {
while(1){
  var value = yield ++i;
  (typeof value === 'number')&&(i=value);
}
}


var gen = anotherGenerator(0);
console.log(gen.next().value);
console.log(gen.next().value);
console.log(gen.next().value);
console.log(gen.next(0).value);
console.log(gen.next());
*/
var fs = require("./logmanager/test.js");
setTimeout(function(){
    require("./logmanager/test.js");
},1000);