const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/projects', express.static(path.join(__dirname, '../Projects')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectName = req.params.projectName;
    const projectPath = path.join(__dirname, '../Projects', projectName);
    cb(null, projectPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Ensure Projects directory exists
async function ensureProjectsDir() {
  const projectsDir = path.join(__dirname, '../Projects');
  try {
    await fs.access(projectsDir);
  } catch {
    await fs.mkdir(projectsDir, { recursive: true });
  }
}

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projectsDir = path.join(__dirname, '../Projects');
    const projects = [];

    const entries = await fs.readdir(projectsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(projectsDir, entry.name);
        const projectJsonPath = path.join(projectPath, 'project.json');

        try {
          const projectData = await fs.readFile(projectJsonPath, 'utf-8');
          const project = JSON.parse(projectData);
          projects.push({ ...project, name: entry.name });
        } catch {
          // If no project.json, create a basic one
          const basicProject = {
            name: entry.name,
            scenes: [],
            createdAt: new Date().toISOString()
          };
          await fs.writeFile(projectJsonPath, JSON.stringify(basicProject, null, 2));
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
app.post('/api/projects', async (req, res) => {
  try {
    const { name } = req.body;
    const projectPath = path.join(__dirname, '../Projects', name);

    // Check if project already exists
    try {
      await fs.access(projectPath);
      return res.status(400).json({ error: 'Project already exists' });
    } catch {
      // Project doesn't exist, continue
    }

    // Create project directory
    await fs.mkdir(projectPath, { recursive: true });

    // Create project.json
    const projectData = {
      name,
      scenes: [],
      createdAt: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(projectPath, 'project.json'),
      JSON.stringify(projectData, null, 2)
    );

    res.json(projectData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project details
app.get('/api/projects/:projectName', async (req, res) => {
  try {
    const { projectName } = req.params;
    const projectPath = path.join(__dirname, '../Projects', projectName, 'project.json');

    const projectData = await fs.readFile(projectPath, 'utf-8');
    const project = JSON.parse(projectData);

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
app.put('/api/projects/:projectName', async (req, res) => {
  try {
    const { projectName } = req.params;
    const updatedProject = req.body;
    const projectPathDir = path.join(__dirname, '../Projects', projectName);
    const projectJsonPath = path.join(projectPathDir, 'project.json');

    // 1. Write the updated project.json
    await fs.writeFile(projectJsonPath, JSON.stringify(updatedProject, null, 2));

    // 2. Build a set of all used resources
    const usedResources = new Set();
    if (updatedProject.scenes) {
      for (const scene of updatedProject.scenes) {
        if (scene.backgroundImage) usedResources.add(decodeURIComponent(path.basename(scene.backgroundImage)));
        if (scene.music) usedResources.add(decodeURIComponent(path.basename(scene.music)));
        if (scene.elements) {
          for (const element of scene.elements) {
            if (element.image) usedResources.add(decodeURIComponent(path.basename(element.image)));
            if (element.onClickSound) usedResources.add(decodeURIComponent(path.basename(element.onClickSound)));
            if (element.onClickMusicChange) usedResources.add(decodeURIComponent(path.basename(element.onClickMusicChange)));
          }
        }
      }
    }

    // 3. Get all files currently in the project directory
    const directoryFiles = await fs.readdir(projectPathDir);

    // 4. Compare and delete unused files
    for (const fileName of directoryFiles) {
      if (fileName === 'project.json') continue;

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
app.delete('/api/projects/:projectName', async (req, res) => {
  try {
    const { projectName } = req.params;
    const projectPath = path.join(__dirname, '../Projects', projectName);

    await fs.rm(projectPath, { recursive: true, force: true });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload file to project
app.post('/api/projects/:projectName/upload', upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      filename: file.filename,
      path: `/projects/${encodeURIComponent(req.params.projectName)}/${encodeURIComponent(file.filename)}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, async () => {
  await ensureProjectsDir();
  console.log(`Server running on port ${PORT}`);
});
