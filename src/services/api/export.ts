import { BaseApiService } from "./base";

export class ExportApiService extends BaseApiService {
  async exportProject(projectName: string): Promise<Blob> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}/export`,
      {
        method: "GET",
      },
    );

    return this.handleBlobResponse(response);
  }
}
