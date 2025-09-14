const express = require("express");
const fs = require("fs").promises;
const ProjectRoutes = require("./routes/projects");
const FileRoutes = require("./routes/files");
const ExportRoutes = require("./routes/export");
const corsMiddleware = require("./middleware/cors");

class Server {
  constructor(projectsDir) {
    this.app = null;
    this.server = null;
    this.serverPort = 0;
    this.projectsDir = projectsDir;
  }

  async start() {
    // Ensure projects directory exists
    await this.ensureProjectsDir();

    // Set up Express server
    this.setupServer();

    // Start server on a random available port
    return new Promise((resolve) => {
      this.server = this.app.listen(0, "localhost", () => {
        this.serverPort = this.server.address().port;
        console.log(`Server running via port ${this.serverPort}`);
        resolve();
      });
    });
  }

  async ensureProjectsDir() {
    try {
      await fs.access(this.projectsDir);
    } catch {
      await fs.mkdir(this.projectsDir, { recursive: true });
    }
  }

  setupServer() {
    this.app = express();

    // Middleware
    this.app.use(corsMiddleware());
    this.app.use(express.json());
    this.app.use("/projects", express.static(this.projectsDir));

    // Routes
    this.app.use(
      "/api/projects",
      new ProjectRoutes(this.projectsDir).getRouter(),
    );
    this.app.use("/api/projects", new FileRoutes(this.projectsDir).getRouter());
    this.app.use(
      "/api/projects",
      new ExportRoutes(this.projectsDir).getRouter(),
    );
  }

  getPort() {
    return this.serverPort;
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = Server;
