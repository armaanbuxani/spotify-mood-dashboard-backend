# Spotify Mood Dashboard — Backend

This is the Flask backend for the [Spotify Mood Dashboard](https://github.com/armaanbuxani/music-mood-frontend), a full-stack web app that uses AI to generate mood summaries based on a user’s top 20 Spotify tracks.

---

## About the Project

The Spotify Mood Dashboard is an AI-powered web app that analyzes the mood of your top Spotify tracks.  
This backend, built with Flask, handles Spotify authentication, lyric extraction, and mood analysis.  
It enables music lovers to visualize how their listening habits reflect their emotions, all in one elegant AI-powered dashboard.

---

## Tech Stack

- Python (Flask)
- Spotipy
- Requests
- OpenAI API
- ScraperAPI (for Genius lyrics)
- Docker (optional)
- Deployed on Render

>This backend mirrors a real-world AI architecture — from third-party data ingestion (Spotify + Genius) to NLP-based mood classification with OpenAI, all integrated via a Python-based REST API.

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

---

## Deployment 

This backend is deployed on Render at:
https://music-mood-backend.onrender.com

>**Note**: Due to Spotify’s developer account limitations, the hosted app may require you to be added as a registered user.
>
>If you'd like access for demo purposes, please reach out or fork the project and run it locally using the setup above.
