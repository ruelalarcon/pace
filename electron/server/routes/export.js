const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const JSZip = require("jszip");
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
      const { initialSceneId, format = "standalone" } = req.query;
      const projectPath = path.join(this.projectsDir, projectName);
      const projectJsonPath = path.join(projectPath, "project.json");

      // Read project data
      const project = await FileUtils.readJsonFile(projectJsonPath);

      if (format === "website") {
        // Export as website folder (ZIP)
        const zipBuffer = await this.generateWebsiteExport(
          project,
          projectPath,
          initialSceneId,
        );

        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${projectName}.zip"`,
        );
        res.send(zipBuffer);
      } else {
        // Export as standalone HTML (existing functionality)
        const { engineCSS, engineJS, geistFontCSS, variablesCSS } =
          await this.getEngineAssets();

        // Collect all resource files and convert to base64
        const resources = await this.collectResources(project, projectPath);

        const html = this.generateExportHTML(
          project,
          variablesCSS + geistFontCSS + engineCSS,
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
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEngineAssets() {
    let engineCSSPath, engineJSPath, geistFontPath, variablesCSSPath;

    // Check if we're in development (running from out/) or production (packaged)
    if (process.env.ELECTRON_RENDERER_URL) {
      // Development - go up from out/main/server/routes/ to reach project root
      engineCSSPath = path.join(__dirname, "../../../../src/engine/Engine.css");
      engineJSPath = path.join(__dirname, "../../../../src/engine/Engine.js");
      variablesCSSPath = path.join(
        __dirname,
        "../../../../src/styles/variables.css",
      );
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
      variablesCSSPath = path.join(appPath, "src/styles/variables.css");
      geistFontPath = path.join(appPath, "src/assets/fonts/Geist[wght].woff2");
    }

    const engineCSS = await fs.readFile(engineCSSPath, "utf-8");
    const variablesCSS = await fs.readFile(variablesCSSPath, "utf-8");
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

    return { engineCSS, engineJS, geistFontCSS, variablesCSS };
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
      </style>
    </head>

    <body class="pace-export">
      <div class="pace-container">
        <div id="pace-canvas" class="pace-canvas"></div>
      </div>

      <script>
        ${engineJS}

        document.addEventListener('DOMContentLoaded', () => {
          const PROJECT_DATA = ${JSON.stringify(project)};
          const RESOURCE_MAP = ${JSON.stringify(resourceMap)};

          new Engine(PROJECT_DATA, RESOURCE_MAP, {
            canvasId: 'pace-canvas'${initialSceneId ? `,\n            initialSceneId: '${initialSceneId}'` : ""}
          });
        });
      </script>
    </body>

    </html>`;
  }

  async generateWebsiteExport(project, projectPath, initialSceneId) {
    const zip = new JSZip();

    // Create a folder with the project name
    const projectFolder = zip.folder(project.name);

    // Get engine assets
    const { engineCSS, engineJS, variablesCSS } = await this.getEngineAssets();

    const styles = `
      ${variablesCSS}
      @font-face {
        font-family: 'Geist';
        src: url('./resources/Geist[wght].woff2') format('woff2');
        font-weight: 100 900;
        font-style: normal;
      }
      ${engineCSS}`;

    projectFolder.file("styles.css", styles);

    // Create engine.js (remove export for browser compatibility)
    const browserEngineJS = engineJS.replace(/export default Engine;.*$/m, "");

    projectFolder.file("engine.js", browserEngineJS);

    // Create index.html
    const indexHTML =
      /*html*/
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${project.name}</title>
        <link rel="stylesheet" href="styles.css">
       </head>
       <body class="pace-export">
         <div class="pace-container">
           <div id="pace-canvas" class="pace-canvas"></div>
         </div>

         <script>
           const PROJECT_DATA = ${JSON.stringify(project)};
         </script>
         <script src="engine.js"></script>
         <script>
           document.addEventListener('DOMContentLoaded', () => {
             new Engine(PROJECT_DATA, {}, {
               canvasId: 'pace-canvas',
               serverUrl: './resources'${initialSceneId ? `,\n               initialSceneId: '${initialSceneId}'` : ""}
             });
           });
         </script>
      </body>
      </html>`;

    projectFolder.file("index.html", indexHTML);

    // Create resources folder and copy all resource files
    const resourcesFolder = projectFolder.folder("resources");
    await this.addResourcesToZip(project, projectPath, resourcesFolder);

    // Add Geist font to resources
    await this.addGeistFontToZip(resourcesFolder);

    // Generate ZIP buffer
    return await zip.generateAsync({ type: "nodebuffer" });
  }

  async addResourcesToZip(project, projectPath, resourcesFolder) {
    if (project.scenes) {
      for (const scene of project.scenes) {
        await this.addSceneResourcesToZip(scene, projectPath, resourcesFolder);
      }
    }
  }

  async addSceneResourcesToZip(scene, projectPath, resourcesFolder) {
    // Background images
    if (scene.backgroundImage) {
      await this.addResourceFileToZip(
        scene.backgroundImage,
        projectPath,
        resourcesFolder,
      );
    }

    // Music files
    if (scene.music) {
      await this.addResourceFileToZip(
        scene.music,
        projectPath,
        resourcesFolder,
      );
    }

    // Element images and sounds
    if (scene.elements) {
      for (const element of scene.elements) {
        if (element.image) {
          await this.addResourceFileToZip(
            element.image,
            projectPath,
            resourcesFolder,
          );
        }
        if (element.onClickSound) {
          await this.addResourceFileToZip(
            element.onClickSound,
            projectPath,
            resourcesFolder,
          );
        }
        if (element.onClickMusicChange) {
          await this.addResourceFileToZip(
            element.onClickMusicChange,
            projectPath,
            resourcesFolder,
          );
        }
      }
    }
  }

  async addResourceFileToZip(resourcePath, projectPath, resourcesFolder) {
    const fileName = decodeURIComponent(path.basename(resourcePath));
    const filePath = path.join(projectPath, fileName);
    try {
      const fileBuffer = await fs.readFile(filePath);
      // Save file directly in resources folder with just the filename
      resourcesFolder.file(fileName, fileBuffer);
    } catch (err) {
      console.warn(`Could not read resource file: ${fileName}`);
    }
  }

  async addGeistFontToZip(resourcesFolder) {
    let geistFontPath;

    // Check if we're in development or production
    if (process.env.ELECTRON_RENDERER_URL) {
      // Development
      geistFontPath = path.join(
        __dirname,
        "../../../../src/assets/fonts/Geist[wght].woff2",
      );
    } else {
      // Production
      const { app } = require("electron");
      const appPath = app.getAppPath();
      geistFontPath = path.join(appPath, "src/assets/fonts/Geist[wght].woff2");
    }

    try {
      const geistFontBuffer = await fs.readFile(geistFontPath);
      resourcesFolder.file("Geist[wght].woff2", geistFontBuffer);
    } catch (err) {
      console.warn("Could not read Geist font file for website export:", err);
    }
  }

  getRouter() {
    return this.router;
  }
}

module.exports = ExportRoutes;
