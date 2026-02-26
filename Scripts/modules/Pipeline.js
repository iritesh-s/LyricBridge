import { final_fast, Repeat } from "./GeneratingLRC.js";
import { moveFiles } from "./Remaining.js";
import { final_embed } from "./Embedding.js";
import {PATHS} from '../utils/paths.js'
import path from "path";

import { spawn } from "child_process";

function runPython(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🐍 Starting Python Task: ${scriptName}...`);

    // This launches the python command

    const py = spawn("python", [scriptName]);

    py.stdout.on("data", (data) => console.log(`[Python]: ${data}`));

    py.stderr.on("data", (data) => console.error(`[Python Error]: ${data}`));

    py.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ ${scriptName} completed successfully.`);

        resolve();
      } else {
        reject(new Error(`${scriptName} failed with code ${code}`));
      }
    });
  });
}

export async function startPipeline(batchSize) {
  try {
    //Storing the LRC files

    await final_fast(PATHS.mp3Folder, PATHS.lrcFolder, batchSize);

    //stroing the data in Dataset.xlsx

    await runPython(path.join(PATHS.modules , 'dataset.py'));

    //beautifying the Dataset.xlsx

    await runPython(path.join(PATHS.modules , 'excel_beautify.py'));

    console.log("\n🎯 ENTIRE PIPELINE COMPLETE!");
  } catch (error) {
    console.error("Critical Start Pipeline Error:", error);
  }
}

export async function repeatPipeline() {
  try {
    //Storing the LRC files

    await Repeat(path.join(PATHS.assets,'Retry.json'), PATHS.lrcFolder);

    //stroing the data in Dataset.xlsx

    await runPython(path.join(PATHS.modules , 'dataset2.py'));

    //beautifying the Dataset.xlsx

    await runPython(path.join(PATHS.modules , 'excel_beautify.py'));

    console.log("\n🎯 REPEAT PIPELINE COMPLETE!");
  } catch (error) {
    console.error("Critical Repeat Pipeline Error:", error);
  }
}

export async function embedPipeline() {
  try {
    //embedding the mp3 files
    await final_embed(path.join(PATHS.root , 'Files'));

    //storing the non-embedded files in a different folder
    await moveFiles(path.join(PATHS.assets,'noLRC.json'), PATHS.mp3Folder);

    //storing the data
    await runPython(path.join(PATHS.modules , 'embedded.py'));

  } catch (error) {
    console.error("Critical Embed Pipeline Error:", error);
  }
}

