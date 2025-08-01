from flask import Blueprint, redirect, request, jsonify
import os
import urllib.parse
import requests

spotify_bp = Blueprint('spotify', __name__)

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL")

@spotify_bp.route('/login')
def login():
    scope = "user-top-read"

    query_params = {
        "client_id" : SPOTIFY_CLIENT_ID,
        "response_type" : "code",
        "redirect_uri" : REDIRECT_URI,
        "scope" : scope,
    }

    auth_url = "https://accounts.spotify.com/authorize?" + urllib.parse.urlencode(query_params)

    return redirect(auth_url)

@spotify_bp.route('/callback')
def callback():
    code = request.args.get("code")

    if not code:
        return "Authorization failed. No code received.", 400
    
    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        "grant_type" : "authorization_code",
        "code" : code,
        "redirect_uri" : REDIRECT_URI,
        "client_id" : SPOTIFY_CLIENT_ID,
        "client_secret" : SPOTIFY_CLIENT_SECRET,
    }
    headers = {
        "Content-Type" : "application/x-www-form-urlencoded"
    }

    response = requests.post(token_url, data=payload, headers=headers)
    
    token_data = response.json()

    if "access_token" in token_data:
        access_token = token_data["access_token"]
        return redirect(f"{FRONTEND_URL}?token={access_token}")
    else:
        return jsonify({
            "error" : "Failed to retrieve access token",
            "details" : token_data
        }), 400
    
@spotify_bp.route('/top-tracks')
def top_tracks():
    access_token = request.args.get("access_token")

    if not access_token:
        return jsonify ({"error" : "Access token is missing."}), 400
    
    endpoint = "https://api.spotify.com/v1/me/top/tracks"
    headers = {
        "Authorization" : f"Bearer {access_token}",
    }
    params = {
        "limit" : 20,
        "time_range" : "short_term",
    }

    response = requests.get(endpoint, headers=headers, params=params)
    data = response.json()

    if response.status_code != 200:
        return jsonify({
            "error" : "Failed to fetch top tracks",
            "details" : data
        }), response.status_code
    
    tracks = []
    for item in data.get("items", []):
        track_info = {
            "name" : item["name"],
            "artist" : item["artists"][0]["name"],
            "album" : item["album"]["name"],
            "image" : item["album"]["images"][0]["url"],
            "url" : item["external_urls"]["spotify"],
        }
        tracks.append(track_info)

    return jsonify ({
        "message" : "Top tracks fetched successfully!",
        "tracks" : tracks,
    })