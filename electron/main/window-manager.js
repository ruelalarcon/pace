const { BrowserWindow } = require("electron");
const path = require("path");

class WindowManager {
  constructor(serverPort) {
    this.mainWindow = null;
    this.serverPort = serverPort;
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "../preload/index.js"),
      },
      icon: process.env.ELECTRON_RENDERER_URL
        ? path.join(__dirname, "../../public/favicon.ico") // Development
        : path.join(__dirname, "../public/favicon.ico"), // Production
      title: "PACE Editor",
      show: false, // Don't show until ready
      // Custom title bar configuration
      frame: false, // Remove entire frame including title bar and controls
      titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    });

    if (!process.env.ELECTRON_RENDERER_URL) {
      // Remove the menu in production
      this.mainWindow.setMenu(null);
    }

    // Wait for server to be ready before loading the app
    this.loadApplication();
  }

  loadApplication() {
    const checkServerReady = () => {
      if (this.serverPort > 0) {
        // In development, connect to Vite dev server; in production, load built files
        if (process.env.ELECTRON_RENDERER_URL) {
          this.mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
        } else {
          // Load the built React app
          const buildPath = path.join(__dirname, "../renderer/index.html");
          this.mainWindow.loadFile(buildPath);
        }
        this.mainWindow.once("ready-to-show", () => {
          this.mainWindow.maximize();
          this.mainWindow.show();
        });
      } else {
        setTimeout(checkServerReady, 100);
      }
    };

    checkServerReady();
  }

  handleActivate() {
    if (BrowserWindow.getAllWindows().length === 0) {
      this.createWindow();
    }
  }

  getMainWindow() {
    return this.mainWindow;
  }
}

module.exports = WindowManager;
