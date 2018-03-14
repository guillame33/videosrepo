const thumbler = require("video-thumb");
const path = require("path");

const { filename } = require("../fileSystem/file.service");

const isMP4 = file => {
  return path.extname(file.toLowerCase()) === ".mp4";
};

const createThumbnail = path => {
  const name = filename(path);
  if (isMP4(path)) {
    try {
      thumbler.extract(
        path,
        `snapshot/${name}_snapshot.png`,
        "00:00:00",
        "200x125",
        err => {
          if (err) console.log("Error generating snapshot : ", err);
          console.log(
            `snapshot saved to ${name} + (200x125) with a frame at 00:00:00`
          );
        }
      );
    } catch (err) {
      console.log("ERROR: ", err);
      process.exit(-1);
    }
  }
};

module.exports = { createThumbnail, isMP4 };
