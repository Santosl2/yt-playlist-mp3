# Youtube Playlist Downloader

Download you favorite playlist from youtube with this simple script. You can download the playlist in mp3 or mp4 format.

![Youtube Playlist Downloader](https://imgur.com/b3oN8xh.gif)

⚠ You must use this module respecting the [YouTube's Copyright Policies](https://www.youtube.com/intl/en/about/copyright/#support-and-troubleshooting).

- [Requirements](#Requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Module Usage](#module-usage)

# Requirements

- [Node.js](https://nodejs.org/it/download/) >= v10
- [`ffmpeg`](https://www.ffmpeg.org/download.html) installed in your system

# Installation

1- Clone this repo

2- Change your youtube playlist url in `src/index.ts` file

3- Run the command

```bash
yarn && yarn dev
```

# Module Usage

You can use this project in your project as a module.

```bash
yarn add youtube-pl
```

### Example usage

```typescript
import { Playlist } from "youtube-pl";

const playlistDownload = new Playlist(
  "YOUR PLAYLIST SLUG HERE",
  "mp4",
  "downloads"
);

playlistDownload.startPlaylistDownload();
```

# Usage

1- Change your youtube playlist url in `src/configs/index.ts` file

2- Run the step 3 of the [Installation](#installation) section

3- You can find your files in the `downloads` folder

# Settings

You can change the settings in the `src/configs/index.ts` file

# License

Copyright [MIT](./LICENSE).

# Special Thanks

- Eomm
