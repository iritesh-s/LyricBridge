import path from 'path'
import { Get_musicDir as GetDir , getSongData } from './Module/GeneratingLRC.js'
import fs from "fs/promises";

const folderPath = "C:/Users/Admin/Music/Test/MP3_files/noLRC_Hindi"

const MP3files = await GetDir(`${folderPath}` , ".mp3")


for(let i =0 ; i <MP3files.length ; i++){
    const MP3path = MP3files[i];
    const metadata = await getSongData(MP3path)
    console.log(path.basename(MP3files[i],'.mp3'))
    const lrcPath =
                folderPath + "/" + path.basename(MP3path, ".mp3") + ".lrc";
              try {
                await fs.writeFile(lrcPath, '');
              } catch (error) {
                //
              }
  }
    
