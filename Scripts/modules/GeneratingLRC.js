import { parseFile } from "music-metadata";
import fs from "fs/promises";
import path from "path";
import { PATHS } from "../utils/paths.js";

export async function Get_musicDir(folderPath, format = ".mp3") {
  try {
    const dir = await fs.readdir(folderPath);

    return dir
      .filter((file) => file.toLowerCase().endsWith(format))
      .map((file) => `${folderPath}/${file}` /*path.join(folderPath, file)*/);
  } catch (error) {
    console.error("Error loading the directory:", error.message);
    return [];
  }
}

export async function getSongData(filePath) {
  try {
    const metadata = await parseFile(filePath);

    return {
      Title: metadata.common.title,
      Artist: metadata.common.artist,
      Duration: Math.round(metadata.format.duration),
    };
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

export async function fetchLyrics(artist, title, duration) {
  const baseUrl = "https://lrclib.net/api/search";

  // Use 'q' for a broader search like the website
  const params = new URLSearchParams({
    q: `${title} ${artist}`,
  });

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.length === 0) {
      return { lyrics: `${url}`, status: `Empty response` };
    }

    //this code is just to use the duration
    let bestMatch = data.filter((obj) => Math.abs(obj.duration - duration) < 3);
    bestMatch = bestMatch[0];

    if (!bestMatch) {
      bestMatch = data[0];
    }

    //?const bestMatch = data[0];
    //this code is a substitute reduces complexity but then the role of duration gets reduced

    //return synced lyrics or plain lyrics or URL based on the priority order
    let status = "";
    let lyrics = "";
    if (bestMatch.syncedLyrics) {
      lyrics = bestMatch.syncedLyrics;
      status = "Synced";
    } else if (bestMatch.plainLyrics) {
      lyrics = bestMatch.plainLyrics;
      status = "Plain";
    } else {
      lyrics = `${url}`;
      status = `URL`;
    }
    //const lyrics = bestMatch?.syncedLyrics || bestMatch?.plainLyrics || `Lyrics exist but no plain text. URL: ${url}`;

    return { lyrics: lyrics, status: status };
  } catch (error) {
    return { lyrics: `${url}`, status: `API Error` };
  }
}

//*Waiting function
export async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
//!This function works in a batch of 5 hence 5 times faster
export async function final_fast(mp3Folder, lrcFolder, batchSize) {
  //?getting the music directory
  const musicDir = await Get_musicDir(mp3Folder, ".mp3");
  if (musicDir.length === 0) {
    console.log("The directory has no .mp3 files.");
    return;
  }
  //console.log(musicDir);

  let Dataset = [];
  let Retry = [];
  let noLRC = [];

  for (let i = 0; i < musicDir.length; i += batchSize) {
    const batch = musicDir.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1}...`);

    await Promise.all(
      batch.map(async (filepath, index) => {
        const globalIndex = i + index;

        const songData = await getSongData(filepath);
        if (!songData) return;

        const song_lyrics = await fetchLyrics(
          songData.Artist || "Unknown Artist",
          songData.Title || path.basename(filepath, ".mp3"),
          songData.Duration,
        );

        let lrc = false;
        if (
          song_lyrics.status !== `API Error` &&
          song_lyrics.status !== `Empty response` &&
          song_lyrics.status !== `URL`
        ) {
          const lrcPath =
            lrcFolder + "/" + path.basename(filepath, ".mp3") + ".lrc";
          try {
            await fs.writeFile(lrcPath, song_lyrics.lyrics);
            lrc = true;
          } catch (error) {
            lrc = false;
          }
        } else {
          Retry.push(filepath);
          noLRC.push(filepath);
        }

        Dataset[globalIndex] = { ...songData, ...song_lyrics, lrc: lrc };
      }),
    );

    console.log("Waiting to avoid API ban...");
    await sleep(2000);
  }
  // console.log(metadata);
  // console.log(lyrics);
  // console.log(Dataset);
  //?Creating json for Retry
  try {
    await fs.writeFile(
      path.join(PATHS.assets, "Retry.json"),
      JSON.stringify(Retry, null, 2),
    );
    console.log("\nThe Retry JSON file is created!\n");
  } catch (error) {
    console.log("Error creating the Retry JSON file: ", error);
    console.log(Retry);
  }
  //?Creating json for noLRC
  try {
    await fs.writeFile(
      path.join(PATHS.assets, "noLRC.json"),
      JSON.stringify(noLRC, null, 2),
    );
    console.log("\nThe noLRC JSON file is created!\n");
  } catch (error) {
    console.log("Error creating the noLRC JSON file: ", error);
    console.log(noLRC);
  }
  //?Creating json for the Dataset
  try {
    await fs.writeFile(
      path.join(PATHS.assets, "lyrics_data.json"),
      JSON.stringify(Dataset, null, 2),
    );
    console.log("\nThe dataset JSON file is created!\n");
  } catch (error) {
    console.log("Error creating the dataset JSON file: ", error);
    console.log(Dataset);
  }
}

export async function Repeat(JSONpath, lrcFolder, batchSize) {
  let musicDir = [];
  try {
    const data = await fs.readFile(JSONpath, "utf8");
    musicDir = JSON.parse(data);
    console.log("Successfully loaded array:", musicDir);
  } catch (err) {
    console.error("Failed to read or parse file:", err.message);
  }

  //?getting the music directory
  if (musicDir.length === 0) {
    console.log("The directory has no .mp3 files.");

    //Also empty the lyrics_data.json empty
    try {
      await fs.writeFile(
        path.join(PATHS.assets, "lyrics_data.json"),
        JSON.stringify([], null, 2),
      );
      console.log("\nThe dataset JSON file is created!\n");
    } catch (error) {
      console.log("Error creating the dataset JSON file: ", error);
      console.log([]);
    }
    return;
  }
  //console.log(musicDir);

  //noLRC should have the files that don't have lrc files 
  let noLRC = [];
  try {
    const data = await fs.readFile(path.join(PATHS.assets, "noLRC.json"), "utf8");
    noLRC = JSON.parse(data);
    console.log("Successfully loaded noLRC array:", noLRC);
  } catch (err) {
    console.error("Failed to read or parse noLRC file:", err.message);
  }

  let Dataset = [];
  let Retry = [];

  for (let i = 0; i < musicDir.length; i += batchSize) {
    const batch = musicDir.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1}...`);

    await Promise.all(
      batch.map(async (filepath, index) => {
        const globalIndex = i + index;

        const songData = await getSongData(filepath);
        if (!songData) return;

        const song_lyrics = await fetchLyrics(
          songData.Artist || "Unknown Artist",
          songData.Title || path.basename(filepath, ".mp3"),
          songData.Duration,
        );

        let lrc = false;
        if (
          song_lyrics.status !== `API Error` &&
          song_lyrics.status !== `Empty response` &&
          song_lyrics.status !== `URL`
        ) {
          const lrcPath =
            lrcFolder + "/" + path.basename(filepath, ".mp3") + ".lrc";
          try {
            await fs.writeFile(lrcPath, song_lyrics.lyrics);
            lrc = true;
          } catch (error) {
            lrc = false;
          }
        } else {
          Retry.push(filepath);
          noLRC.push(filepath);
        }

        Dataset[globalIndex] = { ...songData, ...song_lyrics, lrc: lrc };
      }),
    );

    console.log("Waiting to avoid API ban...");
    await sleep(2000);
  }
  // console.log(metadata);
  // console.log(lyrics);
  // console.log(Dataset);
  //?Creating json for Retry
  try {
    await fs.writeFile(
      path.join(PATHS.assets, "Retry.json"),
      JSON.stringify(Retry, null, 2),
    );
    console.log("\nThe Retry JSON file is created!\n");
  } catch (error) {
    console.log("Error creating the Retry JSON file: ", error);
    console.log(Retry);
  }
  //?Creating json for noLRC
  try {
    await fs.writeFile(
      path.join(PATHS.assets, "noLRC.json"),
      JSON.stringify(noLRC, null, 2),
    );
    console.log("\nThe noLRC JSON file is created!\n");
  } catch (error) {
    console.log("Error creating the noLRC JSON file: ", error);
    console.log(noLRC);
  }
  //?Creating json for the Dataset
  try {
    await fs.writeFile(
      path.join(PATHS.assets, "lyrics_data.json"),
      JSON.stringify(Dataset, null, 2),
    );
    console.log("\nThe dataset JSON file is created!\n");
  } catch (error) {
    console.log("Error creating the dataset JSON file: ", error);
    console.log(Dataset);
  }
}
