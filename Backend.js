'use strict';

const carlo = require('carlo');
const request = require('request');
const screenshot = require('./screenshot');

module.exports = class Backend{

  constructor(app){
    this.app_ = app;
    this.windows_ = new Map();
  }

  getPreviewUrl(lineItemId){
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
  
  async batchScreenshot(formData){
    const obj = JSON.parse(formData);
    console.log('Starting... ', obj.lineItemId, obj.sites);
    try {
      const previews = [];
      const json = await this.getPreviewUrl(obj.lineItemId);
      json.forEach((val) => {
        obj.sites.forEach((site) => {
          const url = site + /(\?google_preview\S*)/.exec(val.previewUrl)[0];
          const filename = val.creativeName.replace(/\W/g, '_') + '_' + site + '_' + val.size;
          if(obj.device === 'desktop' || obj.device === 'mobile') {
            previews.push({ url : url, device : obj.device, filename : filename + '_' + obj.device } );
          } else {
            if (val.size.match(/(320x50)|(320x100)/g)){
              previews.push({ url : url, device : 'mobile', filename : filename + '_mobile' });
            } else if(val.size.match(/(970x90)|(728x90)|(300x600)/g)){
              previews.push({ url : url, device : 'desktop', filename : filename + '_desktop' });
            } else {
              previews.push({ url : url, device : 'mobile', filename : filename + '_mobile' });
              previews.push({ url : url, device : 'desktop', filename : filename + '_desktop' });
            }
          }
        })
      });
      const result = await screenshot.initBatch(previews, obj);
      return result;
    } catch (error) {
      return false;
    }
  }
}