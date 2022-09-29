import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import { from } from "rxjs";
import { mergeMap, toArray } from "rxjs/operators";

import { nameGenerator, randomNameGenerator } from "./nameGenerator.js";
import { getPlaylistInfo } from "./playlistInfo.js";
import { createPath, verifyFileExists } from "./fileExists.js";
import { insertAudio } from "./insertAudio.js";

const MAX_PARALLEL_DOWNLOAD = 1; // Change it

/**
 *
 * @param {string} id the video from which to extrapolate the sound
 * @param {string} fileName filename output
 * @returns {Promise<object>} metadata of the mp3 file generated
 */
async function download(
  videoId,
  fileName,
  fileFormat = "mp3",
  downloadLocale = "../downloads/"
) {
  const url = `http://youtube.com/watch?v=${videoId}`;
  const quality = fileFormat === "mp3" ? "highestaudio" : "highestvideo";

  const filePath = createPath(fileName, downloadLocale);

  if (verifyFileExists(filePath)) {
    console.log("File already exists => ", fileName);
    return;
  }

  // Download video / audio
  const videoStream = ytdl(url, {
    quality,
  });

  // Insert video audio stream if it's a mp4 file
  let audioFileName = null;

  if (fileFormat === "mp4") {
    audioFileName = randomNameGenerator("mp3");

    if (!verifyFileExists(audioFileName)) {
      console.log("Downloading video Audio " + videoId);
      await download(videoId, audioFileName, "mp3", "../tmp/");
    }
  }

  let theResolve;
  let theReject;
  const thePromise = new Promise((resolve, reject) => {
    theResolve = resolve;
    theReject = reject;
  });

  const command = ffmpeg(videoStream, {
    stdoutLines: 0,
  });

  if (audioFileName) {
    insertAudio(command, audioFileName);
  }

  command
    .format(fileFormat)
    .output(filePath)
    .on("start", () => {
      console.log("Downloading ", videoId, fileName);
    })
    .on("end", () => {
      console.log("Download complete => ", fileName);
      if (theResolve) {
        theResolve(fileName);
        theReject = null;
      }
    })
    .on("error", (err) => {
      console.log("Download failed => ", fileName);
      if (theReject) {
        theReject(err);
        theResolve = null;
      }
    });

  process.nextTick(() => {
    command.run();
  });

  return thePromise;
}

/**
 *
 * @param {string} playlistId the id of the playlist to extract the sounds
 * @returns {Promise<[object]>} the results of the downloading, will contains errors and success
 */
async function downloadPlaylist(playlistId, fileFormat = "mp3") {
  const playlistInfo = await getPlaylistInfo(playlistId);
  console.log(`Started playlist download in ${fileFormat} format`);

  const downloadData = async (data) => {
    try {
      const fileName = nameGenerator(data.title, fileFormat);
      const ytFile = await download(data.id, fileName, fileFormat);
      return ytFile;
    } catch (error) {
      console.log(error);
      return {
        id: data.id,
        ref: data,
      };
    }
  };

  const videoObservable = from(playlistInfo.items);

  return videoObservable
    .pipe(mergeMap((video) => downloadData(video), MAX_PARALLEL_DOWNLOAD))
    .pipe(toArray())
    .toPromise();
}

export { downloadPlaylist };
