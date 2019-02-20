const request = require('request');

module.exports = async function (lineItemId){
  return new Promise(function(resolve, reject){
    const url = 'http://192.168.0.252/dfpapi/ci3/lineitem/preview/' + lineItemId;
    request.get(url, {json: true}, function(error, response, body){    
      if(error){
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}