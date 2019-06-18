'use strict';

const fs = require('fs');
const request = require('request');
const screenshot = require('./screenshot');

module.exports = class Backend{

  constructor(app){
    this.app_ = app;
    this.windows_ = new Map();
    fs.stat('./screenshot', (err, stat) => {
      if(err){
        fs.mkdir('./screenshot', err => {console.log(err)});
      }
    });
  }

  getPreviewUrls(lineItemId, callback){
    const url = 'http://192.168.0.252/dfpapi/ci3/lineitem/preview/' + lineItemId;
    request.get(url, {json: true}, function(err, response, body){    
      if(err){
        callback(err);
      } else {
        callback(body);
      }
    });
  }
  
  async batchScreenshot(formData){
    return new Promise( (resolve, reject) => {
      const formObj = JSON.parse(formData);
      console.log('Starting... ', formObj.lineItemId, formObj.sites);    
      const previews = [];
      this.getPreviewUrls(formObj.lineItemId, async json => {
        console.log(typeof json);
        if(typeof json === 'string'){
          reject(json);
        }else {
          json.forEach((val) => {
            formObj.sites.forEach((site) => {
              const previewObj = {};
              previewObj.url = site + /(\?google_preview\S*)/.exec(val.previewUrl)[0];
              previewObj.filename = val.creativeName.replace(/\W/g, '_') + '_' + site + '_' + val.size;
              previewObj.device = formObj.device;
              previewObj.site = site;
    
              if(formObj.device === 'auto') {
                if (val.size.match(/(320x50)|(320x100)/g)){
                  previews.push({url : previewObj.url, filename : previewObj.filename + '_mobile', device : 'mobile', site: previewObj.site});
                } else if(val.size.match(/(970x90)|(728x90)|(300x600)/g)){
                  previews.push({url : previewObj.url, filename : previewObj.filename + '_desktop', device : 'desktop', site: previewObj.site});
                } else {
                  previews.push({url : previewObj.url, filename : previewObj.filename + '_mobile', device : 'mobile', site: previewObj.site});
                  previews.push({url : previewObj.url, filename : previewObj.filename + '_desktop', device : 'desktop', site: previewObj.site});
                }
              } else {
                if(formObj.device === 'desktop' || formObj.device === 'mobile') {
                  previewObj.filename += ('_' + formObj.device);
                }
                previews.push(previewObj);
              }
            })
          });
          await screenshot.initBatch(previews, formObj, (err, result) => {
            if(err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        }
      });
    });
  }
}