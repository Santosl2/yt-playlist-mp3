import { Result } from "ytpl";

import { FfmpegCommand } from "fluent-ffmpeg";

export type ALLOWED_EXTENSION = "mp3" | "mp4";

export interface INameGenerator {
  replaceTextCharacters: (title: string) => string;
  randomNameGenerator: () => number;
}

export interface IDownload {
  startItemDownload: () => Promise<any>;

  download: (format: ALLOWED_EXTENSION, log: boolean) => Promise<unknown>;

  downloadAndInsertVideoAudio: (
    stream: FfmpegCommand
  ) => Promise<FfmpegCommand | undefined>;
}

export interface IPlaylistInfo {
  getPlaylistInfo: () => Promise<Result>;
  startPlaylistDownload: () => Promise<any>;
}
