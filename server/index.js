const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/projects", express.static(path.join(__dirname, "../Projects")));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectName = req.params.projectName;
    const projectPath = path.join(__dirname, "../Projects", projectName);
    cb(null, projectPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Ensure Projects directory exists
async function ensureProjectsDir() {
  const projectsDir = path.join(__dirname, "../Projects");
  try {
    await fs.access(projectsDir);
  } catch {
    await fs.mkdir(projectsDir, { recursive: true });
  }
}

// Get all projects
app.get("/api/projects", async (req, res) => {
  try {
    const projectsDir = path.join(__dirname, "../Projects");
    const projects = [];

    const entries = await fs.readdir(projectsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(projectsDir, entry.name);
        const projectJsonPath = path.join(projectPath, "project.json");

        try {
          const projectData = await fs.readFile(projectJsonPath, "utf-8");
          const project = JSON.parse(projectData);
          projects.push({ ...project, name: entry.name });
        } catch {
          // If no project.json, create a basic one
          const basicProject = {
            name: entry.name,
            scenes: [],
            createdAt: new Date().toISOString(),
          };
          await fs.writeFile(
            projectJsonPath,
            JSON.stringify(basicProject, null, 2),
          );
          projects.push({ ...basicProject, name: entry.name });
        }
      }
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new project
app.post("/api/projects", async (req, res) => {
  try {
    const { name } = req.body;
    const projectPath = path.join(__dirname, "../Projects", name);

    // Check if project already exists
    try {
      await fs.access(projectPath);
      return res.status(400).json({ error: "Project already exists" });
    } catch {
      // Project doesn't exist, continue
    }

    // Create project directory
    await fs.mkdir(projectPath, { recursive: true });

    // Create project.json
    const projectData = {
      name,
      scenes: [],
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(projectPath, "project.json"),
      JSON.stringify(projectData, null, 2),
    );

    res.json(projectData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project details
app.get("/api/projects/:projectName", async (req, res) => {
  try {
    const { projectName } = req.params;
    const projectPath = path.join(
      __dirname,
      "../Projects",
      projectName,
      "project.json",
    );

    const projectData = await fs.readFile(projectPath, "utf-8");
    const project = JSON.parse(projectData);

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
app.put("/api/projects/:projectName", async (req, res) => {
  try {
    const { projectName } = req.params;
    const updatedProject = req.body;
    const projectPathDir = path.join(__dirname, "../Projects", projectName);
    const projectJsonPath = path.join(projectPathDir, "project.json");

    // 1. Write the updated project.json
    await fs.writeFile(
      projectJsonPath,
      JSON.stringify(updatedProject, null, 2),
    );

    // 2. Build a set of all used resources
    const usedResources = new Set();
    if (updatedProject.scenes) {
      for (const scene of updatedProject.scenes) {
        if (scene.backgroundImage)
          usedResources.add(
            decodeURIComponent(path.basename(scene.backgroundImage)),
          );
        if (scene.music)
          usedResources.add(decodeURIComponent(path.basename(scene.music)));
        if (scene.elements) {
          for (const element of scene.elements) {
            if (element.image)
              usedResources.add(
                decodeURIComponent(path.basename(element.image)),
              );
            if (element.onClickSound)
              usedResources.add(
                decodeURIComponent(path.basename(element.onClickSound)),
              );
            if (element.onClickMusicChange)
              usedResources.add(
                decodeURIComponent(path.basename(element.onClickMusicChange)),
              );
          }
        }
      }
    }

    // 3. Get all files currently in the project directory
    const directoryFiles = await fs.readdir(projectPathDir);

    // 4. Compare and delete unused files
    for (const fileName of directoryFiles) {
      if (fileName === "project.json") continue;

      if (!usedResources.has(decodeURIComponent(fileName))) {
        try {
          await fs.unlink(path.join(projectPathDir, fileName));
          console.log(`Cleaned up unused file: ${fileName}`);
        } catch (err) {
          console.error(`Error deleting unused file ${fileName}:`, err);
        }
      }
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
app.delete("/api/projects/:projectName", async (req, res) => {
  try {
    const { projectName } = req.params;
    const projectPath = path.join(__dirname, "../Projects", projectName);

    await fs.rm(projectPath, { recursive: true, force: true });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload file to project
app.post(
  "/api/projects/:projectName/upload",
  upload.single("file"),
  (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      res.json({
        filename: file.filename,
        path: `/projects/${encodeURIComponent(
          req.params.projectName,
        )}/${encodeURIComponent(file.filename)}`,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Export project as single HTML file
app.get("/api/projects/:projectName/export", async (req, res) => {
  try {
    const { projectName } = req.params;
    const projectPath = path.join(__dirname, "../Projects", projectName);
    const projectJsonPath = path.join(projectPath, "project.json");

    // Read project data
    const projectData = await fs.readFile(projectJsonPath, "utf-8");
    const project = JSON.parse(projectData);

    // Read Engine.css and Engine.js
    const engineCSSPath = path.join(__dirname, "../src/components/Engine.css");
    const engineJSPath = path.join(__dirname, "../src/components/Engine.js");
    const engineCSS = await fs.readFile(engineCSSPath, "utf-8");
    const engineJS = await fs.readFile(engineJSPath, "utf-8");

    // Read Geist font and convert to base64
    let geistFontCSS = "";
    try {
      const geistFontPath = path.join(
        __dirname,
        "../src/assets/fonts/Geist[wght].woff2",
      );
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

    // Collect all resource files and convert to base64
    const resources = new Map();

    if (project.scenes) {
      for (const scene of project.scenes) {
        // Background images
        if (scene.backgroundImage) {
          const fileName = decodeURIComponent(
            path.basename(scene.backgroundImage),
          );
          const filePath = path.join(projectPath, fileName);
          try {
            const fileBuffer = await fs.readFile(filePath);
            const mimeType = getMimeType(fileName);
            const base64 = fileBuffer.toString("base64");
            resources.set(
              scene.backgroundImage,
              `data:${mimeType};base64,${base64}`,
            );
          } catch (err) {
            console.warn(`Could not read background image: ${fileName}`);
          }
        }

        // Music files
        if (scene.music) {
          const fileName = decodeURIComponent(path.basename(scene.music));
          const filePath = path.join(projectPath, fileName);
          try {
            const fileBuffer = await fs.readFile(filePath);
            const mimeType = getMimeType(fileName);
            const base64 = fileBuffer.toString("base64");
            resources.set(scene.music, `data:${mimeType};base64,${base64}`);
          } catch (err) {
            console.warn(`Could not read music file: ${fileName}`);
          }
        }

        // Element images and sounds
        if (scene.elements) {
          for (const element of scene.elements) {
            // Element images
            if (element.image) {
              const fileName = decodeURIComponent(path.basename(element.image));
              const filePath = path.join(projectPath, fileName);
              try {
                const fileBuffer = await fs.readFile(filePath);
                const mimeType = getMimeType(fileName);
                const base64 = fileBuffer.toString("base64");
                resources.set(
                  element.image,
                  `data:${mimeType};base64,${base64}`,
                );
              } catch (err) {
                console.warn(`Could not read element image: ${fileName}`);
              }
            }

            // Click sounds
            if (element.onClickSound) {
              const fileName = decodeURIComponent(
                path.basename(element.onClickSound),
              );
              const filePath = path.join(projectPath, fileName);
              try {
                const fileBuffer = await fs.readFile(filePath);
                const mimeType = getMimeType(fileName);
                const base64 = fileBuffer.toString("base64");
                resources.set(
                  element.onClickSound,
                  `data:${mimeType};base64,${base64}`,
                );
              } catch (err) {
                console.warn(`Could not read click sound: ${fileName}`);
              }
            }

            // Music change files
            if (element.onClickMusicChange) {
              const fileName = decodeURIComponent(
                path.basename(element.onClickMusicChange),
              );
              const filePath = path.join(projectPath, fileName);
              try {
                const fileBuffer = await fs.readFile(filePath);
                const mimeType = getMimeType(fileName);
                const base64 = fileBuffer.toString("base64");
                resources.set(
                  element.onClickMusicChange,
                  `data:${mimeType};base64,${base64}`,
                );
              } catch (err) {
                console.warn(`Could not read music change file: ${fileName}`);
              }
            }
          }
        }
      }
    }

    const html = generateExportHTML(
      project,
      geistFontCSS + engineCSS,
      engineJS,
      resources,
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
});

// Helper function to get MIME type
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".m4a": "audio/mp4",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

// Helper function to generate the complete HTML
function generateExportHTML(project, engineCSS, engineJS, resources) {
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
          canvasId: 'pace-canvas'
        });
      });
    </script>
  </body>

  </html>`;
}

app.listen(PORT, async () => {
  await ensureProjectsDir();
  console.log(`Server running on port ${PORT}`);
});
