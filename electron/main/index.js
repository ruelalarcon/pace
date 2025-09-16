const { app } = require('electron');
const path = require('path');
const WindowManager = require('./window-manager');
const IpcHandlers = require('./ipc-handlers');
const Server = require('./server/index');

class PaceElectronApp {
  constructor() {
    this.windowManager = null;
    this.server = null;
    this.ipcHandlers = null;
    this.projectsDir = path.join(app.getPath('userData'), 'Projects');

    this.initializeApp();
  }

  async initializeApp() {
    this.server = new Server(this.projectsDir);
    await this.server.start();
    this.windowManager = new WindowManager(this.server.getPort());
    this.ipcHandlers = new IpcHandlers(this.windowManager, this.projectsDir);
    this.setupElectronEvents();
  }

  setupElectronEvents() {
    app.whenReady().then(() => {
      this.windowManager.createWindow();

      app.on('activate', () => {
        this.windowManager.handleActivate();
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.server.stop();
        app.quit();
      }
    });

    app.on('before-quit', () => {
      this.server.stop();
    });
  }
}

new PaceElectronApp();
