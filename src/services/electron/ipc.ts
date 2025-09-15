export class ElectronIpcService {
  async showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogResult> {
    return window.electronAPI.showOpenDialog(options);
  }

  async getServerPort(): Promise<number> {
    return window.electronAPI.getServerPort();
  }

  async getProjectsDir(): Promise<string> {
    return window.electronAPI.getProjectsDir();
  }

  getPlatform(): string {
    return window.electronAPI.platform;
  }

  getVersions(): { node: string; chrome: string; electron: string } {
    return window.electronAPI.versions;
  }
}

export const electronIpcService = new ElectronIpcService();
