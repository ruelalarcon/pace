import { BaseApiService } from './base';

export class ExportApiService extends BaseApiService {
  async exportProject(
    projectName: string,
    initialSceneId?: string,
    format: 'standalone' | 'website' = 'standalone',
    optimizeResources = true,
  ): Promise<Blob> {
    const baseUrl = await this.getBaseUrl();
    const url = new URL(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}/export`,
    );

    if (initialSceneId) {
      url.searchParams.append('initialSceneId', initialSceneId);
    }

    url.searchParams.append('format', format);
    url.searchParams.append('optimizeResources', String(optimizeResources));

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    return this.handleBlobResponse(response);
  }

  async exportProjectWithProgress(
    projectName: string,
    initialSceneId?: string,
    format: 'standalone' | 'website' = 'standalone',
    optimizeResources = true,
    onProgress?: (status: string) => void,
  ): Promise<Blob> {
    const baseUrl = await this.getBaseUrl();
    const url = new URL(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}/export-progress`,
    );

    if (initialSceneId) {
      url.searchParams.append('initialSceneId', initialSceneId);
    }

    url.searchParams.append('format', format);
    url.searchParams.append('optimizeResources', String(optimizeResources));

    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(url.toString());

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            eventSource.close();
            reject(new Error(data.error));
            return;
          }

          if (data.complete) {
            eventSource.close();
            const bytes = Uint8Array.from(atob(data.data.data), (c) =>
              c.charCodeAt(0),
            );
            const blob = new Blob([bytes], { type: data.data.type });
            resolve(blob);
            return;
          }

          if (data.status && onProgress) {
            onProgress(data.status);
          }
        } catch (err) {
          eventSource.close();
          reject(err);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        reject(new Error('Export stream connection failed'));
      };
    });
  }
}
