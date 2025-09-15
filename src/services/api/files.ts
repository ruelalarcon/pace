import { FileUploadResponse } from '../../types';
import { BaseApiService } from './base';

export class FilesApiService extends BaseApiService {
  async uploadFile(
    projectName: string,
    file: File,
  ): Promise<FileUploadResponse> {
    const baseUrl = await this.getBaseUrl();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    return this.handleResponse<FileUploadResponse>(response);
  }

  async getResourceUrl(resourcePath: string): Promise<string> {
    const baseUrl = await this.getBaseUrl();
    return `${baseUrl}${resourcePath}`;
  }
}
