const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const JSZip = require('jszip');
const os = require('os');
const { randomUUID } = require('crypto');
const FileUtils = require('../utils/file-utils');
const MimeTypes = require('../utils/mime-types');
const sharp = require('sharp');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const prettier = require('prettier');

// Configure ffmpeg binary path for audio conversions
if (ffmpegPath) {
  if (process.env.ELECTRON_RENDERER_URL) {
    // Development
    ffmpeg.setFfmpegPath(ffmpegPath);
  } else {
    // Production - use unpacked ffmpeg binary
    const unpackedFfmpegPath = path.join(
      process.resourcesPath,
      'app.asar.unpacked',
      'node_modules',
      'ffmpeg-static',
      path.basename(ffmpegPath),
    );

    if (require('fs').existsSync(unpackedFfmpegPath)) {
      ffmpeg.setFfmpegPath(unpackedFfmpegPath);
    }
  }
}

class ExportRoutes {
  constructor(projectsDir) {
    this.projectsDir = projectsDir;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // Export project as single HTML file
    this.router.get('/:projectName/export', this.exportProject.bind(this));
  }

  async formatCode(source, parser) {
    return prettier.format(source, { parser, printWidth: 100 });
  }

  async exportProject(req, res) {
    try {
      const { projectName } = req.params;
      const {
        initialSceneId,
        format = 'standalone',
        optimizeResources = 'true',
      } = req.query;
      const optimize = String(optimizeResources).toLowerCase() !== 'false';
      const projectPath = path.join(this.projectsDir, projectName);
      const projectJsonPath = path.join(projectPath, 'project.json');

      // Read project data
      const project = await FileUtils.readJsonFile(projectJsonPath);

      if (format === 'website') {
        // Export as website folder (ZIP)
        const zipBuffer = await this.generateWebsiteExport(
          project,
          projectPath,
          initialSceneId,
          optimize,
        );

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${projectName}.zip"`,
        );
        res.send(zipBuffer);
      } else {
        // Export as standalone HTML (existing functionality)
        const { engineCSS, engineJS, geistFontCSS, variablesCSS } =
          await this.getEngineAssets();

        // Collect all resource files and convert to base64
        const { resources, resourcePathMap } = await this.collectResources(
          project,
          projectPath,
          optimize,
        );

        // Apply resource path mapping for optimized files
        const projectForExport = optimize
          ? this.applyResourcePathMappingStandalone(project, resourcePathMap)
          : project;

        const html = await this.generateExportHTML(
          projectForExport,
          variablesCSS + geistFontCSS + engineCSS,
          engineJS,
          resources,
          initialSceneId,
        );

        res.setHeader('Content-Type', 'text/html');
        res.setHeader(
          'Content-Disposition',
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
      engineCSSPath = path.join(__dirname, '../../../../src/engine/Engine.css');
      engineJSPath = path.join(__dirname, '../../../../src/engine/Engine.js');
      variablesCSSPath = path.join(
        __dirname,
        '../../../../src/styles/variables.css',
      );
      geistFontPath = path.join(
        __dirname,
        '../../../../src/assets/fonts/Geist[wght].woff2',
      );
    } else {
      // Production - files are included in app bundle
      const { app } = require('electron');
      const appPath = app.getAppPath();
      engineCSSPath = path.join(appPath, 'src/engine/Engine.css');
      engineJSPath = path.join(appPath, 'src/engine/Engine.js');
      variablesCSSPath = path.join(appPath, 'src/styles/variables.css');
      geistFontPath = path.join(appPath, 'src/assets/fonts/Geist[wght].woff2');
    }

    const engineCSS = await fs.readFile(engineCSSPath, 'utf-8');
    const variablesCSS = await fs.readFile(variablesCSSPath, 'utf-8');
    let engineJS = await fs.readFile(engineJSPath, 'utf-8');

    // Remove ES module export for browser compatibility in exported file
    engineJS = engineJS.replace('export default Engine;', '');

    // Read Geist font and convert to base64
    let geistFontCSS = '';
    try {
      const geistFontBuffer = await fs.readFile(geistFontPath);
      const geistFontBase64 = geistFontBuffer.toString('base64');
      geistFontCSS = `
      @font-face {
        font-family: 'Geist';
        src: url('data:font/woff2;base64,${geistFontBase64}') format('woff2');
        font-weight: 100 900;
        font-style: normal;
      }
      `;
    } catch (err) {
      console.warn('Could not read Geist font file for embedding:', err);
    }

    return { engineCSS, engineJS, geistFontCSS, variablesCSS };
  }

  async collectResources(project, projectPath, optimize) {
    const resources = new Map();
    const resourcePathMap = {};

    if (project.scenes) {
      // First, collect all unique resource paths
      const uniqueResourcePaths = new Set();
      for (const scene of project.scenes) {
        this.collectUniqueResourcePaths(scene, uniqueResourcePaths);
      }

      // Process each unique resource only once
      for (const resourcePath of uniqueResourcePaths) {
        await this.addResourceToMap(
          resourcePath,
          projectPath,
          resources,
          optimize,
          resourcePathMap,
        );
      }
    }

    return { resources, resourcePathMap };
  }

  collectUniqueResourcePaths(scene, uniqueResourcePaths) {
    // Background images
    if (scene.backgroundImage) {
      uniqueResourcePaths.add(scene.backgroundImage);
    }

    // Music files
    if (scene.music) {
      uniqueResourcePaths.add(scene.music);
    }

    // Element images and sounds
    if (scene.elements) {
      for (const element of scene.elements) {
        if (element.image) {
          uniqueResourcePaths.add(element.image);
        }
        if (element.onClickSound) {
          uniqueResourcePaths.add(element.onClickSound);
        }
        if (element.onClickMusicChange) {
          uniqueResourcePaths.add(element.onClickMusicChange);
        }
      }
    }
  }

  async addResourceToMap(
    resourcePath,
    projectPath,
    resources,
    optimize,
    resourcePathMap,
  ) {
    const fileName = decodeURIComponent(path.basename(resourcePath));
    const filePath = path.join(projectPath, fileName);
    try {
      let fileBuffer = await fs.readFile(filePath);
      const originalExt = path.extname(fileName).toLowerCase();
      const mimeType = MimeTypes.getMimeType(fileName);

      if (optimize && this.shouldOptimizeImage(originalExt)) {
        try {
          const avifBuffer = await this.convertImageToAvif(fileBuffer);
          const base64 = avifBuffer.toString('base64');
          const newResourcePath = this.replaceExt(resourcePath, '.avif');
          resources.set(newResourcePath, `data:image/avif;base64,${base64}`);
          resourcePathMap[resourcePath] = newResourcePath;
          return;
        } catch (e) {
          console.warn(`Failed to convert ${fileName} to AVIF, falling back.`);
        }
      }

      if (optimize && this.shouldOptimizeAudio(originalExt)) {
        try {
          const opusBuffer = await this.convertAudioToOpus(fileBuffer);
          const base64 = opusBuffer.toString('base64');
          const newResourcePath = this.replaceExt(resourcePath, '.opus');
          resources.set(
            newResourcePath,
            `data:audio/ogg;codecs=opus;base64,${base64}`,
          );
          resourcePathMap[resourcePath] = newResourcePath;
          return;
        } catch (e) {
          console.warn(`Failed to convert ${fileName} to Opus, falling back.`);
        }
      }

      const base64 = fileBuffer.toString('base64');
      resources.set(resourcePath, `data:${mimeType};base64,${base64}`);
      resourcePathMap[resourcePath] = resourcePath;
    } catch (err) {
      console.warn(`Could not read resource file: ${fileName}`);
    }
  }

  async generateExportHTML(
    project,
    engineCSS,
    engineJS,
    resources,
    initialSceneId,
  ) {
    const resourceMap = {};
    for (const [originalPath, base64Data] of resources.entries()) {
      resourceMap[originalPath] = base64Data;
    }

    const html = /*html*/ `
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
            canvasId: 'pace-canvas'${
              initialSceneId
                ? `,\n            initialSceneId: '${initialSceneId}'`
                : ''
            }
          });
        });
      </script>
    </body>

    </html>`;

    return this.formatCode(html, 'html');
  }

  async generateWebsiteExport(project, projectPath, initialSceneId, optimize) {
    const zip = new JSZip();

    // Create a folder with the project name
    const projectFolder = zip.folder(project.name);

    // Get engine assets
    const { engineCSS, engineJS, variablesCSS } = await this.getEngineAssets();

    const styles = await this.formatCode(
      `
      ${variablesCSS}
      @font-face {
        font-family: 'Geist';
        src: url('./resources/Geist[wght].woff2') format('woff2');
        font-weight: 100 900;
        font-style: normal;
      }
      ${engineCSS}`,
      'css',
    );

    projectFolder.file('styles.css', styles);

    // Create engine.js (remove export for browser compatibility)
    const browserEngineJS = await this.formatCode(
      engineJS.replace(/export default Engine;.*$/m, ''),
      'babel',
    );

    projectFolder.file('engine.js', browserEngineJS);

    // Prepare resources and optionally optimize
    const resourcesFolder = projectFolder.folder('resources');
    const resourcePathMap = {};
    await this.addResourcesToZip(
      project,
      projectPath,
      resourcesFolder,
      optimize,
      resourcePathMap,
    );

    const projectForExport = optimize
      ? this.applyResourcePathMapping(project, resourcePathMap)
      : project;

    // Create index.html
    const indexHTML = await this.formatCode(
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
           const PROJECT_DATA = ${JSON.stringify(projectForExport)};
         </script>
         <script src="engine.js"></script>
         <script>
           document.addEventListener('DOMContentLoaded', () => {
             new Engine(PROJECT_DATA, {}, {
               canvasId: 'pace-canvas',
               serverUrl: './resources'${
                 initialSceneId
                   ? `,\n               initialSceneId: '${initialSceneId}'`
                   : ''
               }
             });
           });
         </script>
      </body>
      </html>`,
      'html',
    );

    projectFolder.file('index.html', indexHTML);

    // Add Geist font to resources
    await this.addGeistFontToZip(resourcesFolder);

    // Generate ZIP buffer
    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  async addResourcesToZip(
    project,
    projectPath,
    resourcesFolder,
    optimize,
    resourcePathMap,
  ) {
    if (project.scenes) {
      // First, collect all unique resource paths
      const uniqueResourcePaths = new Set();
      for (const scene of project.scenes) {
        this.collectUniqueResourcePaths(scene, uniqueResourcePaths);
      }

      // Process each unique resource only once
      for (const resourcePath of uniqueResourcePaths) {
        await this.addResourceFileToZip(
          resourcePath,
          projectPath,
          resourcesFolder,
          optimize,
          resourcePathMap,
        );
      }
    }
  }

  async addResourceFileToZip(
    resourcePath,
    projectPath,
    resourcesFolder,
    optimize,
    resourcePathMap,
  ) {
    const fileName = decodeURIComponent(path.basename(resourcePath));
    const filePath = path.join(projectPath, fileName);
    try {
      let fileBuffer = await fs.readFile(filePath);
      const ext = path.extname(fileName).toLowerCase();
      let outName = fileName;

      if (optimize && this.shouldOptimizeImage(ext)) {
        try {
          const avifBuffer = await this.convertImageToAvif(fileBuffer);
          outName = this.replaceExt(fileName, '.avif');
          resourcesFolder.file(outName, avifBuffer);
          resourcePathMap[resourcePath] = outName;
          return;
        } catch (e) {
          console.warn(`Failed to convert ${fileName} to AVIF, falling back.`);
        }
      }

      if (optimize && this.shouldOptimizeAudio(ext)) {
        try {
          const opusBuffer = await this.convertAudioToOpus(fileBuffer);
          outName = this.replaceExt(fileName, '.opus');
          resourcesFolder.file(outName, opusBuffer);
          resourcePathMap[resourcePath] = outName;
          return;
        } catch (e) {
          console.warn(`Failed to convert ${fileName} to Opus, falling back.`);
        }
      }

      // Save file directly in resources folder with just the filename
      resourcesFolder.file(outName, fileBuffer);
      resourcePathMap[resourcePath] = outName;
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
        '../../../../src/assets/fonts/Geist[wght].woff2',
      );
    } else {
      // Production
      const { app } = require('electron');
      const appPath = app.getAppPath();
      geistFontPath = path.join(appPath, 'src/assets/fonts/Geist[wght].woff2');
    }

    try {
      const geistFontBuffer = await fs.readFile(geistFontPath);
      resourcesFolder.file('Geist[wght].woff2', geistFontBuffer);
    } catch (err) {
      console.warn('Could not read Geist font file for website export:', err);
    }
  }

  getRouter() {
    return this.router;
  }

  replaceExt(fileName, newExt) {
    return fileName.replace(/\.[^.]+$/i, newExt);
  }

  shouldOptimizeImage(ext) {
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  }

  shouldOptimizeAudio(ext) {
    return ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext);
  }

  async convertImageToAvif(buffer) {
    return await sharp(buffer)
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .avif({ quality: 60 })
      .toBuffer();
  }

  async convertAudioToOpus(buffer) {
    const inPath = path.join(os.tmpdir(), `pace-in-${randomUUID()}`);
    const outPath = path.join(os.tmpdir(), `pace-out-${randomUUID()}.opus`);
    await require('fs').promises.writeFile(inPath, buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inPath)
        .audioCodec('libopus')
        .format('opus')
        .audioBitrate('96k')
        .on('end', resolve)
        .on('error', reject)
        .save(outPath);
    });

    const outBuffer = await require('fs').promises.readFile(outPath);
    try {
      await require('fs').promises.unlink(inPath);
      await require('fs').promises.unlink(outPath);
    } catch {}
    return outBuffer;
  }

  applyResourcePathMapping(project, mapping) {
    const clone = JSON.parse(JSON.stringify(project));
    if (clone.scenes) {
      for (const scene of clone.scenes) {
        if (scene.backgroundImage && mapping[scene.backgroundImage]) {
          scene.backgroundImage = `/${mapping[scene.backgroundImage]}`;
        }
        if (scene.music && mapping[scene.music]) {
          scene.music = `/${mapping[scene.music]}`;
        }
        if (scene.elements) {
          for (const el of scene.elements) {
            if (el.image && mapping[el.image]) {
              el.image = `/${mapping[el.image]}`;
            }
            if (el.onClickSound && mapping[el.onClickSound]) {
              el.onClickSound = `/${mapping[el.onClickSound]}`;
            }
            if (el.onClickMusicChange && mapping[el.onClickMusicChange]) {
              el.onClickMusicChange = `/${mapping[el.onClickMusicChange]}`;
            }
          }
        }
      }
    }
    return clone;
  }

  applyResourcePathMappingStandalone(project, mapping) {
    const clone = JSON.parse(JSON.stringify(project));
    if (clone.scenes) {
      for (const scene of clone.scenes) {
        if (scene.backgroundImage && mapping[scene.backgroundImage]) {
          scene.backgroundImage = mapping[scene.backgroundImage];
        }
        if (scene.music && mapping[scene.music]) {
          scene.music = mapping[scene.music];
        }
        if (scene.elements) {
          for (const el of scene.elements) {
            if (el.image && mapping[el.image]) {
              el.image = mapping[el.image];
            }
            if (el.onClickSound && mapping[el.onClickSound]) {
              el.onClickSound = mapping[el.onClickSound];
            }
            if (el.onClickMusicChange && mapping[el.onClickMusicChange]) {
              el.onClickMusicChange = mapping[el.onClickMusicChange];
            }
          }
        }
      }
    }
    return clone;
  }
}

module.exports = ExportRoutes;
