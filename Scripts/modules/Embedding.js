import NodeID3 from "node-id3";
import path from "path";
import fs from "node:fs/promises";
import { getSongData, Get_musicDir as GetDir } from "./GeneratingLRC.js";
import {PATHS} from '../utils/paths.js'

export async function embedLyrics(LRCpath, MP3path) {
  //*Getting the text out of LRC file
  const metadata = await getSongData(MP3path);

  if(LRCpath === ''){
    return { ...metadata, embedded: false };
  }

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

  console.log(LRCfiles)
  let embeddedDataset = [];
  for (let i = 0; i < MP3files.length; i++) {
    const LRCpath = (
      path.join(folderPath, "LRC_files", path.basename(MP3files[i], ".mp3")) +
      ".lrc"
    )
      .split(path.sep)
      .join(path.posix.sep);
 
    const normalizedSearch = path.normalize(LRCpath);

    const exists = LRCfiles.some(p => path.normalize(p) === normalizedSearch);
    let obj = {};
    if (exists) {
      obj = await embedLyrics(LRCpath, MP3files[i]);
    }else{
      obj = await embedLyrics('',MP3files[i])
    }
    embeddedDataset.push(obj);
  }

  //?Creating json for the embeddedDataset
  try {
    await fs.writeFile(
      path.join(PATHS.assets ,"embedded_data.json"),
      JSON.stringify(embeddedDataset, null, 2),
    );
    console.log("\nThe dataset JSON file is created!\n");
  } catch (error) {
    console.log("Error creating the dataset JSON file: ", error);
    console.log(embeddedDataset);
  }
}

