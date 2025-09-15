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
}
