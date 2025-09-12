import { Project } from "../types";

// Get the server URL from Electron
const getServerUrl = async (): Promise<string> => {
  const port = await (window as any).electronAPI.getServerPort();
  return `http://localhost:${port}`;
};

class ApiService {
  private serverUrl: string | null = null;

  private async getBaseUrl(): Promise<string> {
    if (!this.serverUrl) {
      this.serverUrl = await getServerUrl();
    }
    return this.serverUrl;
  }

  async getProjects(): Promise<Project[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/projects`);
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    return response.json();
  }

  async createProject(name: string): Promise<Project> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create project");
    }

    return response.json();
  }

  async getProject(projectName: string): Promise<Project> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch project");
    }
    return response.json();
  }

  async updateProject(projectName: string, project: Project): Promise<Project> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update project");
    }

    return response.json();
  }

  async deleteProject(projectName: string): Promise<void> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to delete project");
    }
  }

  async uploadFile(
    projectName: string,
    file: File,
  ): Promise<{ filename: string; path: string }> {
    const baseUrl = await this.getBaseUrl();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    return response.json();
  }

  async exportProject(projectName: string): Promise<Blob> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/projects/${encodeURIComponent(projectName)}/export`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to export project");
    }

    return response.blob();
  }

  async getResourceUrl(resourcePath: string): Promise<string> {
    const baseUrl = await this.getBaseUrl();
    return `${baseUrl}${resourcePath}`;
  }

  // Get projects directory
  async getProjectsDir(): Promise<string> {
    return (window as any).electronAPI.getProjectsDir();
  }
}

export const apiService = new ApiService();
