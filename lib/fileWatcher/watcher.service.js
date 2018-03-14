const chokidar = require("chokidar");

const { VIDEO_DIRECTORY, THUMB_DIRECTORY } = require("../../config/index");
const { filename } = require("../fileSystem/file.service");

const watcher = chokidar.watch(VIDEO_DIRECTORY, {
  persistent: true,
  ignored: /^\./,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

// Add event listeners
const watchADD = cb => {
  watcher.on("add", path => {
    console.log(`ADD : ${path}`);
    cb(path);
  });
};

const watchCHANGE = cb => {
  watcher.on("change", path => {
    console.log("Changed : " + path);
    cb(path);
  });
};

const watchDELETE = cb => {
  watcher.on("unlink", path => {
    console.log("DELETE : " + path);
    const pathFileToDelete = `./${THUMB_DIRECTORY}/${filename(
      path
    )}_${THUMB_DIRECTORY}.png`;
    cb(pathFileToDelete);
  });
};

module.exports = {
  watchADD,
  watchCHANGE,
  watchDELETE
};
