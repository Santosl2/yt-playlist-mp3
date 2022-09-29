import path from "path";
import { existsSync, unlinkSync } from "fs";
import { DOWNLOAD_FOLDER, TMP_FOLDER } from "../configs";

export const DOWNLOAD_PATH = (fileName: string) =>
  path.join(__dirname, DOWNLOAD_FOLDER, fileName);

export const TMP_PATH = (fileName: string) =>
  path.join(__dirname, TMP_FOLDER, fileName);

export const verifyFileExists = (path: string) => existsSync(path);
export const deleteFile = (path: string) => unlinkSync(path);
