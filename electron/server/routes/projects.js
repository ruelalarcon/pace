const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const FileUtils = require('../utils/file-utils');

class ProjectRoutes {
  constructor(projectsDir) {
    this.projectsDir = projectsDir;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // Get all projects
    this.router.get('/', this.getAllProjects.bind(this));

    // Create new project
    this.router.post('/', this.createProject.bind(this));

    // Get project details
    this.router.get('/:projectName', this.getProject.bind(this));

    // Update project
    this.router.put('/:projectName', this.updateProject.bind(this));

    // Delete project
    this.router.delete('/:projectName', this.deleteProject.bind(this));
  }

  async getAllProjects(req, res) {
    try {
      const projects = [];
      const entries = await fs.readdir(this.projectsDir, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const projectPath = path.join(this.projectsDir, entry.name);
          const projectJsonPath = path.join(projectPath, 'project.json');

          try {
            const project = await FileUtils.readJsonFile(projectJsonPath);
            projects.push({ ...project, name: entry.name });
          } catch {
            // If no project.json, create a basic one
            const basicProject = {
              name: entry.name,
              scenes: [],
              createdAt: new Date().toISOString(),
            };
            await FileUtils.writeJsonFile(projectJsonPath, basicProject);
            projects.push({ ...basicProject, name: entry.name });
          }
        }
      }

      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createProject(req, res) {
    try {
      const { name } = req.body;
      const projectPath = path.join(this.projectsDir, name);

      // Check if project already exists
      if (await FileUtils.directoryExists(projectPath)) {
        return res.status(400).json({ error: 'Project already exists' });
      }

      // Create project directory
      await FileUtils.ensureDirectoryExists(projectPath);

      // Create project.json
      const projectData = {
        name,
        scenes: [],
        createdAt: new Date().toISOString(),
      };

      await FileUtils.writeJsonFile(
        path.join(projectPath, 'project.json'),
        projectData,
      );

      res.json(projectData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProject(req, res) {
    try {
      const { projectName } = req.params;
      const projectPath = path.join(
        this.projectsDir,
        projectName,
        'project.json',
      );

      const project = await FileUtils.readJsonFile(projectPath);
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProject(req, res) {
    try {
      const { projectName } = req.params;
      const updatedProject = req.body;
      const projectPathDir = path.join(this.projectsDir, projectName);
      const projectJsonPath = path.join(projectPathDir, 'project.json');

      // Write the updated project.json
      await FileUtils.writeJsonFile(projectJsonPath, updatedProject);

      // Build a set of all used resources
      const usedResources =
        FileUtils.getUsedResourcesFromProject(updatedProject);

      // Clean up unused files
      await FileUtils.cleanupUnusedFiles(projectPathDir, usedResources);

      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteProject(req, res) {
    try {
      const { projectName } = req.params;
      const projectPath = path.join(this.projectsDir, projectName);

      await FileUtils.deleteDirectory(projectPath);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getRouter() {
    return this.router;
  }
}

module.exports = ProjectRoutes;
