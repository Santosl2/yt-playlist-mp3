import { FILE_FORMAT, PLAYLIST_SLUG } from "./configs";
import { Playlist } from "./modules";

const playlist = new Playlist(PLAYLIST_SLUG, FILE_FORMAT);

playlist.startPlaylistDownload();
