// Get the server URL from Electron
const getServerUrl = async (): Promise<string> => {
  const port = await (window as any).electronAPI.getServerPort();
  return `http://localhost:${port}`;
};

export class BaseApiService {
  protected serverUrl: string | null = null;

  protected async getBaseUrl(): Promise<string> {
    if (!this.serverUrl) {
      this.serverUrl = await getServerUrl();
    }
    return this.serverUrl;
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new Error(
        error.error || `Request failed with status ${response.status}`,
      );
    }
    return response.json();
  }

  protected async handleBlobResponse(response: Response): Promise<Blob> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new Error(
        error.error || `Request failed with status ${response.status}`,
      );
    }
    return response.blob();
  }
}
