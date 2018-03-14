const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const { promisify } = require("util");
const { createThumbnail } = require("./lib/thumb/thumb.service");
const { VIDEO_DIRECTORY, THUMB_DIRECTORY } = require("./config/index");
const {
  watchADD,
  watchCHANGE,
  watchDELETE
} = require("./lib/fileWatcher/watcher.service");
const {
  listFilesOfDir,
  createDirectory
} = require("./lib/fileSystem/file.service");

const deleteAsync = promisify(fs.unlink);

const PORT = process.env.PORT || 3000;

const initGenerateThumbForVideoDirectory = dir => {
  listFilesOfDir(dir).forEach(element => {
    if (!fs.existsSync(`${THUMB_DIRECTORY}/${element.file}_snapshot.png`)) {
      createThumbnail(element.path);
    }
  });
};

// create directories synchronously on app bootstrap
createDirectory(THUMB_DIRECTORY);
createDirectory(VIDEO_DIRECTORY);

initGenerateThumbForVideoDirectory(VIDEO_DIRECTORY);

const deleteFile = async pathFileToDelete => {
  // todo check if the file to delete exist in snapshot
  await deleteAsync(pathFileToDelete);
};

// Chokidar watcher with callback to handle different events
// When a file is added => create thumbnail
watchADD(createThumbnail);
// When a file is changed (ex: renamed) => create thumbnail
watchCHANGE(createThumbnail);
// When a file is deleted => delete the thumbnail
watchDELETE(deleteFile);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(`${__dirname}/index.htm`));
});

app.get("/videos", (req, res) => {
  console.log("-----------------");
  const videopath = `${VIDEO_DIRECTORY}/sample.mp4`;
  const stat = fs.statSync(videopath);
  const fileSize = stat.size;
  console.log(fileSize);
  const { range } = req.headers;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - (start + 1);
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4"
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT.toString()}`);
});
