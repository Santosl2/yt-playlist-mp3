import { Playlist } from "./modules2/Playlist";

// Insert your playlist URL
const PLAYLIST_SLUG = "PLJmKgWXZQlJPV7o8Ex9oWVi26MGLdBABA";

const playlist = new Playlist(PLAYLIST_SLUG, "mp4");

playlist.startPlaylistDownload();
