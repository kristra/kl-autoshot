const puppeteer = require('puppeteer-core');
const findChrome = require('carlo/lib/find_chrome');
const screenshot = require('./screenshot');


module.exports = async function (urls, parallel){
  const pathToChrome = await findChrome({});
  const batchCount = Math.ceil(url.length / parallel);
  let batch = 0;

  for(let i = 0; i < url.length; i += parallel){
    batch++;
    console.log('Processing ' + batch + ' of ' + batchCount);
    const browser = await puppeteer.launch({executablePath: pathToChrome.executablePath, headless: true});
    const promises = [];

    for(let j = 0; j < parallel; j++){
      const idx = i + j;

      if(url[idx] != undefined){
        const page = await browser.newPage();
        await page.setViewport({width: 1366, height: 650});

        promises.push(screenshot.takeScreenshot(page, url[idx], idx));
      }
    }

    browser.on('targetdestroyed', async function(target){
      const openPages = await browser.pages();
  
      if(openPages.length === 1){
        console.log('Task completed, closing browser ...');
        await browser.close();
        console.log('Browser closed');
      }
    });

    await Promise.all(promises);
  }
}