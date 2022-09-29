import { Playlist } from "./modules";

// Insert your playlist URL
const PLAYLIST_SLUG = "PL7UGDcfHSfuop-pDmKQS8Fuv69GHczPYx";

const playlist = new Playlist(PLAYLIST_SLUG, "mp4");

playlist.startPlaylistDownload();
