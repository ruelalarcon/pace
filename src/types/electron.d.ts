interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  properties?: Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'promptToCreate'
    | 'noResolveAliases'
    | 'treatPackageAsDirectory'
  >;
  message?: string;
}

interface OpenDialogResult {
  canceled: boolean;
  filePaths: string[];
  bookmarks?: string[];
}

declare global {
  interface Window {
    electronAPI: {
      showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogResult>;
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
