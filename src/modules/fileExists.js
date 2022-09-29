import { existsSync, unlinkSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createPath(fileName, downloadLocale = "../downloads/") {
  return path.join(__dirname, downloadLocale, fileName);
}

export function verifyFileExists(file) {
  return existsSync(file);
}

export function deleteAudioFile(file) {
  return unlinkSync(createPath(file, "../tmp/"));
}
