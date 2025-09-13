const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),
  getServerPort: () => ipcRenderer.invoke("get-server-port"),
  getProjectsDir: () => ipcRenderer.invoke("get-projects-dir"),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),
  getPlatform: () => ipcRenderer.invoke("get-platform"),

  // Platform information
  platform: process.platform,

  // App information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});
