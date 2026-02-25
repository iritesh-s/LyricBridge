
# MusicSync-Pipeline 🎵

A modular, high-performance automation pipeline designed to identify MP3 files, fetch synchronized lyrics, and embed them directly into audio metadata.

## 🚀 The Pipeline Logic
The system is divided into four distinct phases to ensure data integrity and bypass API limitations:

1. Metadata Extraction (Node.js)
The script scans a local directory and uses music-metadata to extract internal ID3 tags (Title, Artist, Duration). This ensures the lyrics search is based on actual file data rather than potentially messy filenames.

2. Batch Lyrics Fetching (Node.js)
To optimize speed while respecting API rate limits, the system uses a Batch-Concurrent approach:

Concurrency: Uses Promise.all to process 5 songs simultaneously.

Throttling: Implements a custom sleep() function between batches to avoid IP bans.

Failure Handling: Any song that triggers an API Error or returns an empty response is automatically pushed to a Retry.json file for later processing.

3. Data Visualization & Reporting (Python)
A dedicated Python script processes the resulting lyrics_data.json:

Excel Integration: Converts raw JSON into a formatted Dataset.xlsx.

Styling: Uses openpyxl to color-code statuses (e.g., Green for Synced, Yellow for Plain) for a quick "at-a-glance" audit of the library.

4. ID3 Embedding (Node.js)
The final step closes the loop. It reads the fetched .lrc files and injects them into the MP3's unsynchronisedLyrics frame using node-id3. This makes the lyrics permanent and viewable on mobile music players (PowerAmp, Samsung Music, etc.).

## 🛠️ Project Structure
### ⚙️ Technical Highlights
Batching Logic: Increased processing speed by 500% compared to sequential fetching.

Modular Design: Separated the "Scraper" from the "Tagger" to allow for independent testing and safer file modification.

### 🚀 How It Works
Phase 1: Scan & Fetch
The script extracts Artist, Title, and Duration using music-metadata. It then queries the LRCLIB API to find matching synchronized lyrics.

Phase 2: Report & Audit
The Node.js data is passed to a Python script. Python applies conditional formatting to the Excel file.

Phase 3: Embedding
The Embedder module reads the verified .lrc files and injects them into the MP3's unsynchronisedLyrics ID3 frame. This makes the lyrics "portable" for any mobile music player.

## 🛠Usage

Store the mp3 files in a folder named **"MP3_Files"** in a folder like **"C:\Users\Admin\Music\Test"**

Run the final_fast() function in the Runner.js script then run the dataset.py script
For the remaining files run Repeat() function in the Runner.js script multiple times but after each run again run the dataset.py only once

In the end run the excel_beutify.py script for formatting the Excel document

For embedding:
Run the final_embed() function in the Runner.js script then run the embedded.py script for the excel file.

## 📦 Dependencies
Node.js: music-metadata, node-id3, fs-extra

Python: pandas, openpyxl

## 📈 Future Initiative: "The Wrapped Project" 
The next phase involves extending this pipeline to fetch Album Art and Genre Tags via the Last.fm API to build a custom **"Spotify Wrapped"** style analytics dashboard for local music libraries.