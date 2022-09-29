import { createPath } from "./fileExists.js";

export async function insertAudio(stream, path) {
  const audioPath = createPath(path, "../tmp/");

  return stream.input(audioPath);
}
