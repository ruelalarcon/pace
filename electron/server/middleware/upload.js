const multer = require("multer");
const path = require("path");

const createUploadMiddleware = (projectsDir) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const projectName = req.params.projectName;
      const projectPath = path.join(projectsDir, projectName);
      cb(null, projectPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  return multer({ storage });
};

module.exports = createUploadMiddleware;
