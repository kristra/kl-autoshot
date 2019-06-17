const puppeteer = require('puppeteer-core');
const findChrome = require('carlo/lib/find_chrome');
const hrstart = process.hrtime();

async function screenshot(page, preview, options, filter){
  if (preview.device === 'mobile' && !preview.url.match(/^https:\/\/m./g)) {
    preview.url = 'https://m.' + preview.url;
  } else if (preview.device === 'desktop' && !preview.url.match(/^https:\/\//g)) {
    preview.url = 'https://' + preview.url;
  }
  console.log('Processing: ', preview.filename, preview.url);
  return new Promise(async function(resolve, reject){
    try {
      await page.goto(preview.url, {waitUntil: 'networkidle0', timeout: options.timeout});
      await page.waitForSelector('[data-google-query-id]', {timeout: 500});
      await page.hover('[data-google-query-id=""]');
      await page.hover('[data-google-query-id=""]');
      await page.screenshot({path: preview.filename + '.png'});
      return resolve('success');
    } catch (error) {
      console.log(error.name, error.message);
      if (error instanceof puppeteer.errors.TimeoutError) { 
        await screenshot(page, preview, options, filter) 
      } else {
        return reject(error);
      };
    }
  });
}

async function initBatch (previews, options){
  const pathToChrome = await findChrome({});
  const batchCount = Math.ceil(previews.length / options.parallel);
  const failed = [];
  let batch = 0;
  for(let i = 0; i < previews.length; i += parseInt(options.parallel)){
    batch++;
    console.log('Processing ' + batch + ' of ' + batchCount);
    const browser = await puppeteer.launch({executablePath: pathToChrome.executablePath, args: ['--disable-web-security','--allow-running-insecure-content'], userDataDir:'./dir'});
    const promises = [];
    for(let j = 0; j < options.parallel; j++){
      const idx = i + j;
      if(previews[idx] != undefined){
        const page = await browser.newPage();
        if (previews[idx].device === 'desktop') {
          await page.setViewport({width: 1366, height: 650});
          promises.push(screenshot(page, previews[idx], options, null));
        } else {
          await page.emulate(puppeteer.devices['iPhone 6']);
          promises.push(screenshot(page, previews[idx], options, null));
        }
      }
    }
    const end = await Promise.all(promises);
    await browser.close();
    console.log(end);
    const hrend = process.hrtime(hrstart);
    console.log('Execution time (hr): %ds', hrend[0]);
  }
}

module.exports = { initBatch, screenshot };