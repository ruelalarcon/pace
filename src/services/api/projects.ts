import { Project } from '../../types';
import { BaseApiService } from './base';

export class ProjectsApiService extends BaseApiService {
  async getProjects(): Promise<Project[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/projects`);
    return this.handleResponse<Project[]>(response);
  }

  async createProject(name: string): Promise<Project> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    return this.handleResponse<Project>(response);
  }

  async getProject(projectName: string): Promise<Project> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}`,
    );
    return this.handleResponse<Project>(response);
  }

  async updateProject(projectName: string, project: Project): Promise<Project> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      },
    );
    return this.handleResponse<Project>(response);
  }

  async deleteProject(projectName: string): Promise<void> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
  }
}
