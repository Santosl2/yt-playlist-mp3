export function nameGenerator(title, fileFormat = "mp3") {
  return `${title.replace(/[\\/:*?"<>|]/g, "")}.${fileFormat}`;
}

export function randomNameGenerator(fileFormat = "mp3") {
  return `${new Date().getTime()}.${fileFormat}`;
}
