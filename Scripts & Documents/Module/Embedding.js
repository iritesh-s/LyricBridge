import NodeID3 from "node-id3";
import path from "path";
import fs from "node:fs/promises";
import { getSongData, Get_musicDir as GetDir } from "./GeneratingLRC.js";

export async function embedLyrics(LRCpath, MP3path) {
  //*Getting the text out of LRC file
  const metadata = await getSongData(MP3path);

  let lyrics = "";
  try {
    lyrics = await fs.readFile(LRCpath, "utf8");
    console.log("Successfully loaded lyrics");
  } catch (err) {
    console.error("Failed to read or parse file:", err.message);
    return { ...metadata, embedded: false };
  }

  const tags = {
    unsynchronisedLyrics: {
      language: "eng",
      text: lyrics,
    },
  };

  try {
    const success = NodeID3.update(tags, MP3path);
    if (!success) {
      console.error("ID3 Update returned false (Check if file is locked/open)");
    }
    return { ...metadata, embedded: success };
  } catch (err) {
    console.error(`MP3 Write Error (${MP3path}):`, err.message);
    return { ...metadata, embedded: false };
  }
}

export async function final_embed(folderPath) {
  const LRCfiles = await GetDir(`${folderPath}/LRC_files`, ".lrc");
  const MP3files = await GetDir(`${folderPath}/MP3_files`, ".mp3");

  let embeddedDataset = [];
  for (let i = 0; i < LRCfiles.length; i++) {
    const MP3path = (
      path.join(folderPath, "MP3_files", path.basename(LRCfiles[i], ".lrc")) +
      ".mp3"
    )
      .split(path.sep)
      .join(path.posix.sep);

    if (MP3files.includes(MP3path)) {
      const obj = await embedLyrics(LRCfiles[i], MP3path);
      embeddedDataset.push(obj);
    }
  }

  //?Creating json for the embeddedDataset
  try {
    await fs.writeFile(
      "./Documents/embedded_data.json",
      JSON.stringify(embeddedDataset, null, 2),
    );
    console.log("\nThe dataset JSON file is created!\n");
  } catch (error) {
    console.log("Error creating the dataset JSON file: ", error);
    console.log(embeddedDataset);
  }
}
