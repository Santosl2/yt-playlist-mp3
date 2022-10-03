import ytpl from "ytpl";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";

import { ALLOWED_EXTENSION, IDownload } from "../interfaces";
import { NameGenerator } from "./NameGenerator";
import {
  deleteFile,
  DOWNLOAD_PATH,
  TMP_PATH,
  verifyFileExists,
} from "../helpers";
import { DOWNLOAD_FOLDER } from "../configs";

export class Download implements IDownload {
  private YOUTUBE_URL = "https://www.youtube.com/watch?v=";
  private QUALITY = {
    mp3: "highestaudio",
    mp4: "highestvideo",
  };

  private fileName: string = "";

  constructor(
    private video: ytpl.Item,
    private fileFormat: ALLOWED_EXTENSION,
    private downloadFolder: string = DOWNLOAD_FOLDER,
    private nameGenerator: NameGenerator = new NameGenerator()
  ) {
    this.fileFormat = fileFormat;
    this.video = video;
    this.downloadFolder = downloadFolder;
  }

  async downloadAndInsertVideoAudio(
    stream: ffmpeg.FfmpegCommand
  ): Promise<ffmpeg.FfmpegCommand | undefined> {
    await this.download("mp3", true);

    const audioPath = TMP_PATH(this.fileName);

    return stream.input(audioPath);
  }

  async download(
    format = this.fileFormat,
    isAudioDownload = false
  ): Promise<unknown> {
    const { video } = this;
    const PATH = !isAudioDownload ? DOWNLOAD_PATH : TMP_PATH;
    if (!video) {
      console.log("Video is not defined");
      return;
    }

    const output = PATH(this.fileName, this.downloadFolder);

    if (verifyFileExists(output)) {
      console.log(
        `File ${this.fileName} already exists in folder ${this.downloadFolder}`
      );
      return;
    }

    const videoUrl = this.YOUTUBE_URL + video.id;

    const videoStream = ytdl(videoUrl, {
      quality: this.QUALITY[format],
    });

    const command = ffmpeg(videoStream, {
      stdoutLines: 0,
    });

    // When downloading mp4, we need to download the video and audio separately
    // and then merge them together
    if (format === "mp4") {
      await this.downloadAndInsertVideoAudio(command);
    }

    const promise = new Promise((resolve, reject) => {
      command
        .format(format)
        .output(output)
        .on("start", () => {
          if (!isAudioDownload) console.log("Downloading ", video.title);
        })
        .on("end", () => {
          if (!isAudioDownload) {
            console.log("Download complete => ", video.title);

            // Delete Audio TMP file
            if (format === "mp4") {
              deleteFile(TMP_PATH(this.fileName));
            }
          }

          resolve(video);
        })
        .on("error", (err) => {
          console.log("Download failed => ", video.title);
          reject(err);
        });
    });

    process.nextTick(() => {
      command.run();
    });

    return promise;
  }

  async startItemDownload(
    fileFormat: ALLOWED_EXTENSION | undefined = undefined
  ) {
    const format = fileFormat || this.fileFormat;
    try {
      this.fileName = `${this.nameGenerator.replaceTextCharacters(
        this.video.title
      )}.${format}`;

      const ytFile = await this.download();
      return ytFile;
    } catch (error) {
      console.log(error);
    }
  }
}
