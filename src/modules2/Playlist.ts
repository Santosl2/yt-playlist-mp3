import ytpl from "ytpl";
import { ALLOWED_EXTENSION } from "../interfaces/File";
import { from } from "rxjs";
import { mergeMap, toArray } from "rxjs/operators";
import { Download } from "./Download";

interface IPlaylistInfo {
  getPlaylistInfo: () => Promise<ytpl.Result>;
  startPlaylistDownload: () => Promise<any>;
}

export class Playlist implements IPlaylistInfo {
  private MAX_PARALLEL_DOWNLOAD = 1;

  private fileFormat: ALLOWED_EXTENSION;
  private playlistId: string;

  constructor(playlistId: string, fileFormat: ALLOWED_EXTENSION = "mp3") {
    this.playlistId = playlistId;
    this.fileFormat = fileFormat;
  }

  async getPlaylistInfo(): Promise<ytpl.Result> {
    const playlistInfo = await ytpl(this.playlistId);

    return playlistInfo;
  }

  async startPlaylistDownload(): Promise<any> {
    const playlistInfo = await this.getPlaylistInfo();
    const playlistVideoItems = playlistInfo.items;

    console.log(`Started playlist download in ${this.fileFormat} format`);

    const videoObservable = from(playlistVideoItems);
    return videoObservable
      .pipe(
        mergeMap((video) => {
          const downloadClass = new Download(video, this.fileFormat);

          return downloadClass.startItemDownload();
        }, this.MAX_PARALLEL_DOWNLOAD)
      )
      .pipe(toArray())
      .toPromise();
  }
}
