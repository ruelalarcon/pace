export class ElectronIpcService {
  async showOpenDialog(options: any): Promise<any> {
    return (window as any).electronAPI.showOpenDialog(options);
  }

  async getServerPort(): Promise<number> {
    return (window as any).electronAPI.getServerPort();
  }

  async getProjectsDir(): Promise<string> {
    return (window as any).electronAPI.getProjectsDir();
  }

  getPlatform(): string {
    return (window as any).electronAPI.platform;
  }

  getVersions(): any {
    return (window as any).electronAPI.versions;
  }
}

export const electronIpcService = new ElectronIpcService();
