# Spotify Mood Dashboard — Backend

This is the Flask backend for the [Spotify Mood Dashboard](https://github.com/armaanbuxani/music-mood-frontend), a full-stack web app that uses AI to generate mood summaries based on a user’s top 20 Spotify tracks.

It handles:
- Spotify OAuth + access token processing
- Fetching top 20 tracks from Spotify
- Extracting lyrics using Genius (via ScraperAPI)
- Running sentiment analysis with OpenAI
- Generating mood summaries (overall + per track)

---

## Tech Stack

- Python (Flask)
- Spotipy
- Requests
- OpenAI API
- ScraperAPI (for Genius lyrics)
- Docker (optional)
- Deployed on Render

---

## Environment Variables

Create a `.env` file in the root of the backend project with the following variables:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://music-mood-backend.onrender.com/callback

GENIUS_API_KEY=your_genius_api_key
OPENAI_API_KEY=your_openai_api_key
SCRAPER_API_KEY=your_scraper_api_key
```

---

## Setup Instructions

You can run the backend locally or with Docker:

### Local Setup 

Run these commands in your local terminal 
```bash
git clone https://github.com/armaanbuxani/music-mood-backend
cd music-mood-backend
pip install -r requirements.txt
cp .env.example .env  
python app.py
```

### Docker Setup 

Run these commands in your local terminal
```bash
git clone https://github.com/armaanbuxani/music-mood-backend
cd music-mood-backend
cp .env.example .env  # Then fill in your API keys and credentials 
docker build -t music-mood-backend .
docker run -p 5000:5000 --env-file .env music-mood-backend
```
>Server runs at http://localhost:5000

---

## API Overview 

| Method | Endpoint           | Description                                  |
|--------|--------------------|----------------------------------------------|
| GET    | `/top-tracks`      | Fetches user's top 20 Spotify tracks         |
| GET    | `/lyrics`          | Retrieves lyrics for a given track and artist |
| POST   | `/analyze-mood`    | Analyzes mood based on provided lyrics       |
| POST   | `/overall-mood`    | Generates overall mood summary from tracks   |
