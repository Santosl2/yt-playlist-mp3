import ytpl from "ytpl";

/**
 *
 * @param {string} playlistId the id of the playlist to extract the sounds
 * @returns {Promise<[object]>} the results of playlist, will contains errors and success
 */
export function getPlaylistInfo(playlistId) {
  console.log("Load information from Playlist => ", playlistId);
  return ytpl(playlistId);
}
