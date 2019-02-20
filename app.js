const carlo = require('carlo');
const { rpc } = require('carlo/rpc');
const Backend = require('./Backend');

async function run(){
  const app = await carlo.launch(
    {title: 'Main', width: 800, height: 600, top: 10, left: 100 });
  app.on('exit', () => process.exit());
  const mainWindow = app.mainWindow();
  mainWindow.on('close', () => process.exit());
  mainWindow.serveFolder(__dirname);
  mainWindow.load('./www/index.html', rpc.handle(new Backend(app)));
}

module.exports = { run };
