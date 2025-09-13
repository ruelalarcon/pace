const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const FileUtils = require("../utils/file-utils");
const MimeTypes = require("../utils/mime-types");

class ExportRoutes {
  constructor(projectsDir) {
    this.projectsDir = projectsDir;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // Export project as single HTML file
    this.router.get("/:projectName/export", this.exportProject.bind(this));
  }

  async exportProject(req, res) {
    try {
      const { projectName } = req.params;
      const { initialSceneId } = req.query;
      const projectPath = path.join(this.projectsDir, projectName);
      const projectJsonPath = path.join(projectPath, "project.json");

      // Read project data
      const project = await FileUtils.readJsonFile(projectJsonPath);

      // Read Engine.css and Engine.js
      const { engineCSS, engineJS, geistFontCSS } =
        await this.getEngineAssets();

      // Collect all resource files and convert to base64
      const resources = await this.collectResources(project, projectPath);

      const html = this.generateExportHTML(
        project,
        geistFontCSS + engineCSS,
        engineJS,
        resources,
        initialSceneId,
      );

      res.setHeader("Content-Type", "text/html");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${projectName}.html"`,
      );
      res.send(html);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEngineAssets() {
    let engineCSSPath, engineJSPath, geistFontPath;

    // Check if we're in development (running from out/) or production (packaged)
    if (process.env.ELECTRON_RENDERER_URL) {
      // Development - go up from out/main/server/routes/ to reach project root
      engineCSSPath = path.join(__dirname, "../../../../src/engine/Engine.css");
      engineJSPath = path.join(__dirname, "../../../../src/engine/Engine.js");
      geistFontPath = path.join(
        __dirname,
        "../../../../src/assets/fonts/Geist[wght].woff2",
      );
    } else {
      // Production - files are included in app bundle
      const { app } = require("electron");
      const appPath = app.getAppPath();
      engineCSSPath = path.join(appPath, "src/engine/Engine.css");
      engineJSPath = path.join(appPath, "src/engine/Engine.js");
      geistFontPath = path.join(appPath, "src/assets/fonts/Geist[wght].woff2");
    }

    const engineCSS = await fs.readFile(engineCSSPath, "utf-8");
    let engineJS = await fs.readFile(engineJSPath, "utf-8");

    // Remove ES module export for browser compatibility in exported file
    engineJS = engineJS.replace("export default Engine;", "");

    // Read Geist font and convert to base64
    let geistFontCSS = "";
    try {
      const geistFontBuffer = await fs.readFile(geistFontPath);
      const geistFontBase64 = geistFontBuffer.toString("base64");
      geistFontCSS = `
      @font-face {
        font-family: 'Geist';
        src: url('data:font/woff2;base64,${geistFontBase64}') format('woff2');
        font-weight: 100 900;
        font-style: normal;
      }
      `;
    } catch (err) {
      console.warn("Could not read Geist font file for embedding:", err);
    }

    return { engineCSS, engineJS, geistFontCSS };
  }

  async collectResources(project, projectPath) {
    const resources = new Map();

    if (project.scenes) {
      for (const scene of project.scenes) {
        await this.collectSceneResources(scene, projectPath, resources);
      }
    }

    return resources;
  }

  async collectSceneResources(scene, projectPath, resources) {
    // Background images
    if (scene.backgroundImage) {
      await this.addResourceToMap(
        scene.backgroundImage,
        projectPath,
        resources,
      );
    }

    // Music files
    if (scene.music) {
      await this.addResourceToMap(scene.music, projectPath, resources);
    }

    // Element images and sounds
    if (scene.elements) {
      for (const element of scene.elements) {
        if (element.image) {
          await this.addResourceToMap(element.image, projectPath, resources);
        }
        if (element.onClickSound) {
          await this.addResourceToMap(
            element.onClickSound,
            projectPath,
            resources,
          );
        }
        if (element.onClickMusicChange) {
          await this.addResourceToMap(
            element.onClickMusicChange,
            projectPath,
            resources,
          );
        }
      }
    }
  }

  async addResourceToMap(resourcePath, projectPath, resources) {
    const fileName = decodeURIComponent(path.basename(resourcePath));
    const filePath = path.join(projectPath, fileName);
    try {
      const fileBuffer = await fs.readFile(filePath);
      const mimeType = MimeTypes.getMimeType(fileName);
      const base64 = fileBuffer.toString("base64");
      resources.set(resourcePath, `data:${mimeType};base64,${base64}`);
    } catch (err) {
      console.warn(`Could not read resource file: ${fileName}`);
    }
  }

  generateExportHTML(project, engineCSS, engineJS, resources, initialSceneId) {
    const resourceMap = {};
    for (const [originalPath, base64Data] of resources.entries()) {
      resourceMap[originalPath] = base64Data;
    }

    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${project.name}</title>
      <style>
        ${engineCSS}

        body {
          margin: 0;
          padding: 0;
          background-color: #1e1e2e;
          color: #cdd6f4;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          overflow: hidden;
        }

        .pace-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #1e1e2e;
          position: relative;
          padding: 16px;
          box-sizing: border-box;
        }

        .pace-canvas {
          border: 2px solid #313244;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }
      </style>
    </head>

    <body>
      <div class="pace-container">
        <div id="pace-canvas" class="pace-canvas"></div>
      </div>

      <script>
        ${engineJS}

        document.addEventListener('DOMContentLoaded', () => {
          const PROJECT_DATA = ${JSON.stringify(project)};
          const RESOURCE_MAP = ${JSON.stringify(resourceMap)};

          new Engine(PROJECT_DATA, RESOURCE_MAP, {
            canvasId: 'pace-canvas'${initialSceneId ? `,\n            initialSceneId: '${initialSceneId}'` : ''}
          });
        });
      </script>
    </body>

    </html>`;
  }

  getRouter() {
    return this.router;
  }
}

module.exports = ExportRoutes;
