from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent.parent.parent

PATHS = {
    "root": ROOT,
    "assets": ROOT / 'Scripts' / "assets",
    "mp3Folder": ROOT / 'Files' / 'MP3_files',
    "lrcFolder": ROOT / 'Files' / 'LRC_files',
    "documents": ROOT / 'Files' / 'Documents',
    "modules": ROOT / 'Scripts' / 'modules',
}
