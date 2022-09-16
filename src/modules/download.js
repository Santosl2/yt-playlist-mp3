import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { from } from "rxjs";
import { mergeMap, toArray } from "rxjs/operators";
import { existsSync } from "fs";
import { fileURLToPath } from "url";

import { nameGenerator } from "./nameGenerator.js";
import { getPlaylistInfo } from "./playlistInfo.js";

const MAX_PARALLEL_DOWNLOAD = 3; // Change it

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *
 * @param {string} id the video from which to extrapolate the sound
 * @param {!string} fileName optinal filename output
 * @returns {Promise<object>} metadata of the mp3 file generated
 */
async function download(videoId, fileName, downloadLocale) {
  const url = `http://youtube.com/watch?v=${videoId}`;

  const videoStream = ytdl(url, {
    quality: "highestaudio",
  });

  const filePath = path.join(__dirname, downloadLocale, fileName);

  if (existsSync(filePath)) {
    console.log("File already exists => ", fileName);
    return;
  }

  const info = {
    id: videoId,
    fileName,
    path: downloadLocale,
    filePath,
  };

  let theResolve;
  let theReject;
  const thePromise = new Promise((resolve, reject) => {
    theResolve = resolve;
    theReject = reject;
  });

  const command = ffmpeg(videoStream, {
    stdoutLines: 0,
  })
    .format("mp3")
    .output(info.filePath)
    .on("start", () => {
      console.log("Downloading ", videoId, fileName);
    })
    .on("end", () => {
      console.log("Download complete => ", info.fileName);
      if (theResolve) {
        theResolve(info);
        theReject = null;
      }
    })
    .on("error", (err) => {
      console.log("Download failed => ", info.fileName);
      if (theReject) {
        theReject(err);
        theResolve = null;
      }
    })
    .on("progress", (progress) => {});

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
async function downloadPlaylist(playlistId, downloadLocale) {
  const playlistInfo = await getPlaylistInfo(playlistId);
  console.log("Started playlist download");

  const downloadingSongs = async (song) => {
    try {
      const songFileName = nameGenerator(song.title);
      const songFile = await download(song.id, songFileName, downloadLocale);
      return songFile;
    } catch (error) {
      console.log(error);
      return {
        id: song.id,
        ref: song,
      };
    }
  };

  const videoObservable = from(playlistInfo.items);

  return videoObservable
    .pipe(mergeMap((video) => downloadingSongs(video), MAX_PARALLEL_DOWNLOAD))
    .pipe(toArray())
    .toPromise();
}

export { downloadPlaylist };
