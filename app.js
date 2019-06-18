const carlo = require('carlo');
const { rpc } = require('carlo/rpc');
const Backend = require('./Backend');
const path = require('path');

async function run(){
  const app = await carlo.launch(
    {
      title: 'Main', 
      width: 800, 
      height: 600, 
      top: 10, 
      left: 150, 
      args: ['--allow-running-insecure-content', '--disable-web-security'], 
      userDataDir: "./tmp", 
      icon: path.join(__dirname, './www/assets/pepeico.jpg'),
    });
  app.on('exit', () => process.exit());
  const mainWindow = app.mainWindow();
  mainWindow.on('close', () => process.exit());
  mainWindow.serveFolder(__dirname);
  mainWindow.maximize();
  mainWindow.load('./www/index.html', rpc.handle(new Backend(app)));
}

module.exports = { run };
