declare global {
  interface Window {
    electronAPI: {
      showOpenDialog: (options: any) => Promise<any>;
      getServerPort: () => Promise<number>;
      getProjectsDir: () => Promise<string>;
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      getPlatform: () => Promise<string>;
      platform: string;
      versions: {
        node: string;
        chrome: string;
        electron: string;
      };
    };
  }
}

export {};
