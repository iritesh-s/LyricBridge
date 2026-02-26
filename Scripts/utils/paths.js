import { fileURLToPath } from 'url';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PROJECT_ROOT = path.resolve(__dirname, '../../');

export const PATHS = {
    root: PROJECT_ROOT,
    assets: path.join(PROJECT_ROOT, 'Scripts','assets'),
    mp3Folder: path.join(PROJECT_ROOT, 'Files', 'MP3_files'),
    lrcFolder: path.join(PROJECT_ROOT, 'Files', 'LRC_files'),
    documents: path.join(PROJECT_ROOT, 'Files', 'Documents'),
    modules: path.join(PROJECT_ROOT,'Scripts' ,'modules'),
};
