const fs = require("fs");
const path = require("path");

const filename = sPath => {
  return path.basename(sPath);
};

const listFilesOfDir = dir => {
  return fs
    .readdirSync(dir)
    .reduce(
      (files, file) =>
        fs.statSync(path.join(dir, file)).isDirectory()
          ? files.concat(read(path.join(dir, file)))
          : files.concat({ path: path.join(dir, file), file }),
      []
    );
};

const createDirectory = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

module.exports = {
  filename,
  listFilesOfDir,
  createDirectory
};
