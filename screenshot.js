const puppeteer = require('puppeteer-core');

async function takeScreenshot(page, url, idx){
  console.log('Now processing: ', idx, url)

  try{
    await page.goto(url,{waitUntil: 'networkidle0', timeout: 15000});

    // filter
    // await page.hover(`div[data-google-query-id=""]`);
    // filter
    
    await page.screenshot({path: idx + '.png'});
    await page.close();
  } catch(error){
    console.log(idx, error.name);
    if(error.name === 'TimeoutError'){
      await takeScreenshot(page, url, idx);
    }
  }  
}

module.exports = { takeScreenshot };