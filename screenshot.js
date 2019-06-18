const puppeteer = require('puppeteer-core');
const findChrome = require('carlo/lib/find_chrome');
const fs = require('fs');
const GIFEncoder = require('gif-encoder');
const getPixels = require('get-pixels');
const hrstart = process.hrtime();
const workDir = './temp-gif/';
const iPhone8SD = {
      'name': 'iPhone 8',
      'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
      'viewport': {
        'width': 375,
        'height': 667,
        'deviceScaleFactor': 1,
        'isMobile': true,
        'hasTouch': true,
        'isLandscape': false
      }
    };

async function screenshot(page, preview, options, callback){
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
    if(options.ext === '.gif') {
      await page.emulate(iPhone8SD);
      const viewPort = await page.viewport();
      const encoder = new GIFEncoder(viewPort.width, viewPort.height);
      let file = fs.createWriteStream('screenshot/' + preview.filename + '.gif');
      encoder.setFrameRate(30);
      encoder.pipe(file);
      encoder.setQuality(40);
      encoder.setDelay(500);
      encoder.writeHeader();
      encoder.setRepeat(0);
      const queue = [];
      fs.stat(workDir, (err, stat) => {
        if(err){
          fs.mkdir(workDir, err => {console.log(err)});
        }
      });
      for (let i = 0; i < 30; i++) {
        queue.push(await page.screenshot({ path: workDir + i + ".jpg", quality: 75 }));
        await page.waitFor(500);
      }
      await Promise.all(queue).then(callback(true, encoder));
    } else {
      await page.screenshot({path: 'screenshot/' + preview.filename + options.ext});
      callback(null);
    }
  } catch (error) {
    // console.log(error.name, error.message);
    if (error instanceof puppeteer.errors.TimeoutError) { 
      await screenshot(page, preview, options, callback);
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
          promises.push(screenshot(page, previews[idx], options, (preview, encoder)=>{
            if(preview === true) {
              let listOfPNGs = fs.readdirSync(workDir)
                .map(a => a.substr(0, a.length - 4) + '')
                .sort(function (a, b) { return a - b })
                .map(a => workDir + a.substr(0, a.length) + '.png');
              addToGif(listOfPNGs, encoder);
            } else { failed.push(preview) }
          }));
        } else {
          await page.emulate(iPhone8SD);
          promises.push(screenshot(page, previews[idx], options, (preview, encoder)=>{
            if(preview === true) {
              let listOfPNGs = fs.readdirSync(workDir)
                .map(a => a.substr(0, a.length - 4) + '')
                .sort(function (a, b) { return a - b })
                .map(a => workDir + a.substr(0, a.length) + '.jpg');
                console.log(listOfPNGs);
              addToGif(listOfPNGs, encoder);
            } else { failed.push(preview) }
          }));
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

function addToGif(images, encoder, counter = 0, ) {
  getPixels(images[counter], function (err, pixels) {
    
    encoder.addFrame(pixels.data);
    encoder.read();
    if (counter === images.length - 1) {
      encoder.finish();
      cleanUp(images, function (err) {
        if (err) {
          console.log(err);
        } else {
          // fs.rmdirSync(workDir);
          console.log('Gif created!');
        }
      });
    } else {
      addToGif(images, encoder, ++counter);
    }
  });
};

function cleanUp(listOfPNGs, callback) {
  let i = listOfPNGs.length;

  listOfPNGs.forEach(function (filepath) {
    fs.unlink(filepath, function (err) {
      i--;
      if (err) {
        callback(err);
        return;
      } else if (i <= 0) {
        callback(null);
      }
    });
  });
};


module.exports = { initBatch, screenshot };