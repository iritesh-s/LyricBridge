
# LYRICBRIDGE 🎵

A modular automation pipeline designed to identify MP3 files, fetch synchronized lyrics, and embed them directly into audio metadata.

## How to Use?

### 🚀 Quick Start
1. Clone the Repository

    `git clone https://github.com/your-username/your-repo-name.git`

2. Install Dependencies

    `npm install`

    Python:
    You will need pandas and openpyxl for data processing and Excel beautification.
    
    `pip install pandas openpyxl`

3. Prepare Your Files
    Place your MP3 files in the following directory:
    Files/MP3_files/

### 🛠 Using the Pipeline
To run the pipeline, open Runner.js and uncomment the functions you wish to execute, then run:
node Runner.js

#### Step 1: startPipeline(batchSize)
Processes your MP3 files in batches to fetch/generate lyrics.

Recommendation: Use a batch size of 5 to maintain stability.

Action: Uncomment startPipeline(5); in Runner.js.

#### Step 2: repeatPipeline()
Attempts to retry lyric generation for any files that failed during the initial start.

Recommendation: Run this at least once; you can run it multiple times to maximize success rates.

Action: Uncomment repeatPipeline(); in Runner.js.

#### Step 3: embedPipeline()
Finalizes the process by embedding the lyrics into the MP3 metadata.

Constraint: Run this only once at the very end.

Action: Uncomment embedPipeline(); in Runner.js.

### 📂 Output & Results
Once the pipeline finishes, your files are organized into the following structure:

* LRC Lyrics: All generated .lrc files are stored in Files/LRC_files.

* Failed Matches: MP3 files for which no lyrics could be generated are moved to Files/MP3_files/noLRC.

* Documentation: All data logs, datasets, and generated Excel files can be found in Files/Documents.

* Processed MP3s: Your final, embedded files are located in the Files/ directory.

## 🚀 The Pipeline Logic
The system is divided into four distinct phases to ensure data integrity and bypass API limitations:

### 1. Metadata Extraction (Node.js)
The script scans a local directory and uses music-metadata to extract internal ID3 tags (Title, Artist, Duration). This ensures the lyrics search is based on actual file data rather than potentially messy filenames.

### 2. Batch Lyrics Fetching (Node.js)
To optimize speed while respecting API rate limits, the system uses a Batch-Concurrent approach:

Concurrency: Uses Promise.all to process 5 songs simultaneously.

Throttling: Implements a custom sleep() function between batches to avoid IP bans.

Failure Handling: Any song that triggers an API Error or returns an empty response is automatically pushed to a Retry.json file for later processing.

### 3. Data Visualization & Reporting (Python)
A dedicated Python script processes the resulting lyrics_data.json:

Excel Integration: Converts raw JSON into a formatted Dataset.xlsx.

Styling: Uses openpyxl to color-code statuses (e.g., Green for Synced, Yellow for Plain) for a quick "at-a-glance" audit of the library.

### 4. ID3 Embedding (Node.js)
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

## 📦 Dependencies
Node.js: music-metadata, node-id3, fs-extra

Python: pandas, openpyxl