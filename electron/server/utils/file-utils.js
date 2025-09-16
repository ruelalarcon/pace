const fs = require('fs').promises;
const path = require('path');

class FileUtils {
  static async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  static async directoryExists(dirPath) {
    try {
      await fs.access(dirPath);
      return true;
    } catch {
      return false;
    }
  }

  static async readJsonFile(filePath) {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }

  static async writeJsonFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  static async deleteDirectory(dirPath) {
    await fs.rm(dirPath, { recursive: true, force: true });
  }

  static async cleanupUnusedFiles(projectDir, usedResources) {
    const directoryFiles = await fs.readdir(projectDir);

    for (const fileName of directoryFiles) {
      if (fileName === 'project.json') continue;

      if (!usedResources.has(decodeURIComponent(fileName))) {
        try {
          await fs.unlink(path.join(projectDir, fileName));
          console.log(`Cleaned up unused file: ${fileName}`);
        } catch (err) {
          console.error(`Error deleting unused file ${fileName}:`, err);
        }
      }
    }
  }

  static getUsedResourcesFromProject(project) {
    const usedResources = new Set();

    if (project.scenes) {
      for (const scene of project.scenes) {
        if (scene.backgroundImage) {
          usedResources.add(
            decodeURIComponent(path.basename(scene.backgroundImage)),
          );
        }
        if (scene.music) {
          usedResources.add(decodeURIComponent(path.basename(scene.music)));
        }
        if (scene.elements) {
          for (const element of scene.elements) {
            if (element.image) {
              usedResources.add(
                decodeURIComponent(path.basename(element.image)),
              );
            }
            if (element.onClickSound) {
              usedResources.add(
                decodeURIComponent(path.basename(element.onClickSound)),
              );
            }
            if (element.onClickMusicChange) {
              usedResources.add(
                decodeURIComponent(path.basename(element.onClickMusicChange)),
              );
            }
          }
        }
      }
    }

    return usedResources;
  }
}

module.exports = FileUtils;
