const puppeteer = require('puppeteer-core');
const findChrome = require('carlo/lib/find_chrome');
const path = require('path');
const hrstart = process.hrtime();

async function screenshot(page, preview, options, filter, callback){
  if (preview.device === 'mobile' && !preview.url.match(/^https:\/\/m./g)) {
    preview.url = 'https://m.' + preview.url;
  } else if (preview.device === 'desktop' && !preview.url.match(/^https:\/\//g)) {
    preview.url = 'https://' + preview.url;
  }
  console.log('Processing: ', preview.filename, preview.url);
  try {
    await page.goto(preview.url, {waitUntil: 'networkidle0', timeout: options.timeout});
    await page.waitForSelector('[data-google-query-id]', {timeout: 500});
    await page.hover('[data-google-query-id=""]');
    await page.hover('[data-google-query-id=""]');
    await page.screenshot({path: 'screenshot/' + preview.filename + options.ext});
    callback(true);
  } catch (error) {
    // console.log(error.name, error.message);
    if (error instanceof puppeteer.errors.TimeoutError) { 
      await screenshot(page, preview, options, filter, callback);
    } else {
      callback({preview : preview, error : error.message});
    };
  }
}

async function initBatch (previews, options){
  const pathToChrome = await findChrome({});
  const batchCount = Math.ceil(previews.length / options.parallel);
  const failed = [];
  let batch = 0;
  for(let i = 0; i < previews.length; i += parseInt(options.parallel)){
    batch++;
    console.log('Processing ' + batch + ' of ' + batchCount);
    const browser = await puppeteer.launch({executablePath: pathToChrome.executablePath, args: ['--disable-web-security','--allow-running-insecure-content'], userDataDir: './tmp'});
    const promises = [];
    for(let j = 0; j < options.parallel; j++){
      const idx = i + j;
      if(previews[idx] != undefined){
        const page = await browser.newPage();
        if (previews[idx].device === 'desktop') {
          await page.setViewport({width: 1366, height: 650});
          promises.push(screenshot(page, previews[idx], options, null, (preview)=>{failed.push(preview)}));
        } else {
          await page.emulate(puppeteer.devices['iPhone 8']);
          promises.push(screenshot(page, previews[idx], options, null, (preview)=>{failed.push(preview)}));
        }
      }
    }
    await Promise.all(promises);
    await browser.close();
    const hrend = process.hrtime(hrstart);
    console.log('Execution time (hr): %ds', hrend[0]);    
  }
  return failed;
}

module.exports = { initBatch, screenshot };