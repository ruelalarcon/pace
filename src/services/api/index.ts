import { Project } from '../../types/project';
import { ExportApiService } from './export';
import { FilesApiService } from './files';
import { ProjectsApiService } from './projects';

class ApiService {
  private projectsService = new ProjectsApiService();
  private filesService = new FilesApiService();
  private exportService = new ExportApiService();

  // Project methods
  getProjects = () => this.projectsService.getProjects();
  createProject = (name: string) => this.projectsService.createProject(name);
  getProject = (projectName: string) =>
    this.projectsService.getProject(projectName);
  updateProject = (projectName: string, project: Project) =>
    this.projectsService.updateProject(projectName, project);
  deleteProject = (projectName: string) =>
    this.projectsService.deleteProject(projectName);

  // File methods
  uploadFile = (projectName: string, file: File) =>
    this.filesService.uploadFile(projectName, file);
  getResourceUrl = (resourcePath: string) =>
    this.filesService.getResourceUrl(resourcePath);

  // Export methods
  exportProject = (
    projectName: string,
    initialSceneId?: string,
    format?: 'standalone' | 'website',
    optimizeResources?: boolean,
  ) =>
    this.exportService.exportProject(
      projectName,
      initialSceneId,
      format,
      optimizeResources,
    );

  exportProjectWithProgress = (
    projectName: string,
    initialSceneId?: string,
    format?: 'standalone' | 'website',
    optimizeResources?: boolean,
    onProgress?: (status: string) => void,
  ) =>
    this.exportService.exportProjectWithProgress(
      projectName,
      initialSceneId,
      format,
      optimizeResources,
      onProgress,
    );

  // Electron integration
  async getProjectsDir(): Promise<string> {
    return window.electronAPI.getProjectsDir();
  }
}

export const apiService = new ApiService();
