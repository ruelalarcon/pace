import { ProjectsApiService } from "./projects";
import { FilesApiService } from "./files";
import { ExportApiService } from "./export";

class ApiService {
  private projectsService = new ProjectsApiService();
  private filesService = new FilesApiService();
  private exportService = new ExportApiService();

  // Project methods
  getProjects = () => this.projectsService.getProjects();
  createProject = (name: string) => this.projectsService.createProject(name);
  getProject = (projectName: string) =>
    this.projectsService.getProject(projectName);
  updateProject = (projectName: string, project: any) =>
    this.projectsService.updateProject(projectName, project);
  deleteProject = (projectName: string) =>
    this.projectsService.deleteProject(projectName);

  // File methods
  uploadFile = (projectName: string, file: File) =>
    this.filesService.uploadFile(projectName, file);
  getResourceUrl = (resourcePath: string) =>
    this.filesService.getResourceUrl(resourcePath);

  // Export methods
  exportProject = (projectName: string) =>
    this.exportService.exportProject(projectName);

  // Electron integration
  async getProjectsDir(): Promise<string> {
    return (window as any).electronAPI.getProjectsDir();
  }
}

export const apiService = new ApiService();
