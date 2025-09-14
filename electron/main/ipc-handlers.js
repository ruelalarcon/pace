const { ipcMain, dialog } = require("electron");

class IpcHandlers {
  constructor(windowManager, projectsDir) {
    this.windowManager = windowManager;
    this.projectsDir = projectsDir;
    this.setupHandlers();
  }

  setupHandlers() {
    // Handle opening file dialogs for file uploads
    ipcMain.handle("show-open-dialog", async (event, options) => {
      const result = await dialog.showOpenDialog(
        this.windowManager.getMainWindow(),
        options,
      );
      return result;
    });

    // Handle getting server port
    ipcMain.handle("get-server-port", () => {
      return this.windowManager.serverPort;
    });

    // Handle getting projects directory
    ipcMain.handle("get-projects-dir", () => {
      return this.projectsDir;
    });

    // Window control handlers
    ipcMain.handle("minimize-window", () => {
      const mainWindow = this.windowManager.getMainWindow();
      if (mainWindow) {
        mainWindow.minimize();
      }
    });

    ipcMain.handle("maximize-window", () => {
      const mainWindow = this.windowManager.getMainWindow();
      if (mainWindow) {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
      }
    });

    ipcMain.handle("close-window", () => {
      const mainWindow = this.windowManager.getMainWindow();
      if (mainWindow) {
        mainWindow.close();
      }
    });

    ipcMain.handle("get-platform", () => {
      return process.platform;
    });
  }
}

module.exports = IpcHandlers;
