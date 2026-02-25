import { final_fast, Repeat } from "./GeneratingLRC.js";
import { moveFiles } from "./Remaining.js";
import { final_embed } from "./Embedding.js";

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

    await final_fast("../Files/MP3_files", "../Files/LRC_files", batchSize);

    //stroing the data in Dataset.xlsx

    await runPython("./Module/dataset.py");

    //beautifying the Dataset.xlsx

    await runPython("./Module/excel_beautify.py");

    console.log("\n🎯 ENTIRE PIPELINE COMPLETE!");
  } catch (error) {
    console.error("Critical Start Pipeline Error:", error);
  }
}

export async function repeatPipeline() {
  try {
    //Storing the LRC files

    await Repeat("./Documents/Retry.json", "../Files/LRC_files");

    //stroing the data in Dataset.xlsx

    await runPython("./Module/dataset2.py");

    //beautifying the Dataset.xlsx

    await runPython("./Module/excel_beautify.py");

    console.log("\n🎯 REPEAT PIPELINE COMPLETE!");
  } catch (error) {
    console.error("Critical Repeat Pipeline Error:", error);
  }
}

export async function embedPipeline() {
  try {
    //embedding the mp3 files
    await final_embed("../Files");

    //storing the non-embedded files in a different folder
    await moveFiles("./Documents/Retry.json", "../Files/MP3_files");

    //storing the data
    await runPython("./Module/dataset2.py");
  } catch (error) {
    console.error("Critical Embed Pipeline Error:", error);
  }
}
