export function nameGenerator(title) {
  return `${title.replace(/[\\/:*?"<>|]/g, "")}.mp3`;
}
