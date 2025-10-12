const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const files = fs.readdirSync(distDir);

files.forEach((file) => {
  if (file.endsWith('.zip') || file.endsWith('.tar.gz')) {
    const ext = file.endsWith('.tar.gz') ? '.tar.gz' : '.zip';
    const newName = file.replace(ext, `_portable${ext}`);
    fs.renameSync(path.join(distDir, file), path.join(distDir, newName));
  }
});
