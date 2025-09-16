const express = require('express');
const createUploadMiddleware = require('../middleware/upload');

class FileRoutes {
  constructor(projectsDir) {
    this.projectsDir = projectsDir;
    this.router = express.Router();
    this.upload = createUploadMiddleware(projectsDir);
    this.setupRoutes();
  }

  setupRoutes() {
    // Upload file to project
    this.router.post(
      '/:projectName/upload',
      this.upload.single('file'),
      this.uploadFile.bind(this),
    );
  }

  uploadFile(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      res.json({
        filename: file.filename,
        path: `/projects/${encodeURIComponent(req.params.projectName)}/${encodeURIComponent(file.filename)}`,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getRouter() {
    return this.router;
  }
}

module.exports = FileRoutes;
