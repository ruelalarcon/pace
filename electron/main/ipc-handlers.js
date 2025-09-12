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
  }
}

module.exports = IpcHandlers;
