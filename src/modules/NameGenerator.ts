import { INameGenerator } from "../interfaces";

export class NameGenerator implements INameGenerator {
  replaceTextCharacters(title: string) {
    return title.replace(/[\\/:*?"<>|]/g, "");
  }

  randomNameGenerator() {
    return new Date().getTime() * Math.round(Math.random() * 1000);
  }
}
