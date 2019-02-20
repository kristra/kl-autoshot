'use strict';

const carlo = require('carlo');
const jsonAPI = require('./api');
const batch = require('./batch');

module.exports = class Backend{

  constructor(app){
    this.app_ = app;
    this.windows_ = new Map();
  }
  
  async lineItemShot(lineItemId, sites, devices, parallel){
    const json = await jsonAPI(lineItemId);
    const urls = [];
    json.forEach(function(val){
      for(let i = 0; i < sites.length; i++){
        const regex = /(\?google_preview\S*)/;
        urls.push({
          url : sites[i] + regex.exec(val.previewUrl),
          filename : sites[i] + val.creativeId
        });
      }
    });

    Promise.all(urls);
    console.log(urls);

    return json;
  }
}
