import ytpl from "ytpl";
import { ALLOWED_EXTENSION, IPlaylistInfo } from "../interfaces";
import { from } from "rxjs";
import { mergeMap, toArray } from "rxjs/operators";
import { Download } from "./Download";
import { DOWNLOAD_FOLDER, MAX_PARALLEL_DOWNLOAD } from "../configs";

export class Playlist implements IPlaylistInfo {
  private fileFormat: ALLOWED_EXTENSION;
  private playlistId: string;
  private downloadFolder: string;

  constructor(
    playlistId: string,
    fileFormat: ALLOWED_EXTENSION = "mp3",
    downloadFolder = DOWNLOAD_FOLDER
  ) {
    this.playlistId = playlistId;
    this.fileFormat = fileFormat;
    this.downloadFolder = downloadFolder;
  }

  async getPlaylistInfo(): Promise<ytpl.Result> {
    const playlistInfo = await ytpl(this.playlistId);

    return playlistInfo;
  }

  async startPlaylistDownload(): Promise<any> {
    const playlistInfo = await this.getPlaylistInfo();
    const playlistVideoItems = playlistInfo.items;

    console.log(
      `Started ${
        playlistInfo.title
      } playlist download in ${this.fileFormat.toUpperCase()} format and ${
        this.downloadFolder
      } folder`
    );

    const videoObservable = from(playlistVideoItems);
    return videoObservable
      .pipe(
        mergeMap((video) => {
          const downloadClass = new Download(
            video,
            this.fileFormat,
            this.downloadFolder
          );

          return downloadClass.startItemDownload();
        }, MAX_PARALLEL_DOWNLOAD)
      )
      .pipe(toArray())
      .toPromise();
  }
}
