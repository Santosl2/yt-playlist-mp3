import ytpl from "ytpl";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";

import { ALLOWED_EXTENSION } from "../interfaces/File";
import { NameGenerator } from "./NameGenerator";
import { DOWNLOAD_PATH, TMP_PATH, verifyFileExists } from "../helpers";

interface IDownload {
  startItemDownload: () => Promise<any>;

  download: (format: ALLOWED_EXTENSION, log: boolean) => Promise<unknown>;

  insertVideoAudio: (
    stream: ffmpeg.FfmpegCommand
  ) => Promise<ffmpeg.FfmpegCommand | undefined>;
}

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
    private nameGenerator: NameGenerator = new NameGenerator()
  ) {
    this.fileFormat = fileFormat;
    this.video = video;
  }

  async insertVideoAudio(
    stream: ffmpeg.FfmpegCommand
  ): Promise<ffmpeg.FfmpegCommand | undefined> {
    const audioName = `${this.nameGenerator.randomNameGenerator()}.mp3`;
    const path = TMP_PATH(audioName);

    if (!verifyFileExists(path)) return undefined;

    await this.download("mp3", true);

    return stream.input(path);
  }

  async download(
    format = this.fileFormat,
    isAudioDownload = false
  ): Promise<unknown> {
    const video = this.video;

    if (!video) {
      return "Video is not defined";
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
      await this.insertVideoAudio(command);
    }

    const PATH = !isAudioDownload ? DOWNLOAD_PATH : TMP_PATH;

    const promise = new Promise((resolve, reject) => {
      command
        .format(format)
        .output(PATH(this.fileName))
        .on("start", () => {
          if (!isAudioDownload) console.log("Downloading ", video.title);
        })
        .on("end", () => {
          if (!isAudioDownload)
            console.log("Download complete => ", video.title);

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

  async startItemDownload(fileFormat: ALLOWED_EXTENSION = "mp3") {
    try {
      this.fileName = `${this.nameGenerator.replaceTextCharacters(
        this.video.title
      )}.${fileFormat}`;

      const ytFile = await this.download();
      return ytFile;
    } catch (error) {
      console.log(error);
    }
  }
}
