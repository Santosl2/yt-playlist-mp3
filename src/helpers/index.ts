import path from "path";
import { existsSync, unlinkSync } from "fs";

export const DOWNLOAD_PATH = (fileName: string) =>
  path.join(__dirname, "../../downloads/", fileName);

export const TMP_PATH = (fileName: string) =>
  path.join(__dirname, "../tmp/", fileName);

export const verifyFileExists = (path: string) => existsSync(path);
export const deleteFile = (path: string) => unlinkSync(path);
