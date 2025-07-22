from flask import Blueprint, request, jsonify
from bs4 import BeautifulSoup
import os
import requests
import re

genius_bp = Blueprint('genius', __name__)

GENIUS_ACCESS_TOKEN = os.getenv("GENIUS_ACCESS_TOKEN")

@genius_bp.route('/lyrics')
def genius_search():
    track = request.args.get('track')
    artist = request.args.get('artist')

    if not track or not artist:
        return jsonify({"error" : "Missing 'track' or 'artist'."})
    
    headers = {
        "Authorization" : f"Bearer {GENIUS_ACCESS_TOKEN}"
    }
    params = {
        "q": f"{track} {artist}"
    }

    response = requests.get("https://api.genius.com/search", headers=headers, params=params)

    if response.status_code != 200:
        return jsonify({"error": "Genius API call failed."}), 500
    
    data = response.json()
    hits = data.get("response", {}).get("hits", [])

    if not hits:
        return jsonify({"error": "No results found."}), 404
    
    first_result = hits[0]["result"]
    song_title = re.sub(r"\s+", " ", first_result["full_title"]).strip()
    song_url = "https://genius.com" + first_result["path"]

    lyrics = scrape_lyrics_from_url(song_url)
    if not lyrics:
        return jsonify({"error": "Lyrics could not be extracted"}), 500
    
    return jsonify({
        "track": track,
        "artist": artist,
        "lyrics": lyrics
    })

    
def scrape_lyrics_from_url(url):
    try:
        page = requests.get(url)
        soup = BeautifulSoup(page.text, "html.parser")

        lyrics_divs = soup.find_all("div", attrs={"data-lyrics-container": "true"})

        all_text = "\n".join(div.get_text(separator="\n").strip() for div in lyrics_divs)
        all_text = re.sub(r"\n{2,}", "\n\n", all_text.strip())

        # ✅ Start from first [Intro] / [Verse] / [Chorus]
        section_start_match = re.search(r"(\[Intro\]|\[Verse.*?\]|\[Chorus\])", all_text)
        if section_start_match:
            start_index = section_start_match.start()
            lyrics = all_text[start_index:]
        else:
            lyrics = all_text  # fallback if no tags found

        return lyrics.strip()

    except Exception as e:
        print(f"Scraping error: {e}")
        return None