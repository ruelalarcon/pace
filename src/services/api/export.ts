import { BaseApiService } from "./base";

export class ExportApiService extends BaseApiService {
  async exportProject(
    projectName: string,
    initialSceneId?: string,
  ): Promise<Blob> {
    const baseUrl = await this.getBaseUrl();
    const url = new URL(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}/export`,
    );

    if (initialSceneId) {
      url.searchParams.append("initialSceneId", initialSceneId);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
    });

    return this.handleBlobResponse(response);
  }
}
