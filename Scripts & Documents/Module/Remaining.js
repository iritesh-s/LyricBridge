import fs from "fs/promises";
import path from "path";

export async function moveFiles(JSONpath, filePath) {
  let filesToMove = [];
  try {
    const data = await fs.readFile(JSONpath, "utf8");
    filesToMove = JSON.parse(data);
    console.log("Successfully loaded array:", filesToMove);
  } catch (err) {
    console.error("Failed to read or parse file:", err.message);
  }

  const sourceDir = filePath;
  const targetSubDir = "noLRC";

  const targetPath = path.join(sourceDir, targetSubDir);

  try {
    // 1. Create the sub-directory if it doesn't exist
    await fs.mkdir(targetPath, { recursive: true });

    // 2. Map through files and move them
    await Promise.all(
      filesToMove.map((fullfile) => {
        const file = path.basename(fullfile);
        const oldPath = path.join(sourceDir, file);
        const newPath = path.join(targetPath, file);

        console.log(`Moving: ${file} → ${targetSubDir}/`);
        return fs.rename(oldPath, newPath);
      }),
    );

    console.log("All files moved successfully!");
  } catch (err) {
    console.error("Error moving files:", err.message);
  }
}
