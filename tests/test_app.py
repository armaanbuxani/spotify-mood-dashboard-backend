import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from unittest.mock import patch
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client
    
def test_home_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert response.data.decode('utf-8') == "Music Mood Dashboard Backend Running!"

@patch('routes.spotify.requests.get')
def test_top_tracks(mock_get, client):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {
        "items": [
            {
                "name": "Test Song",
                "artists": [{"name": "Test Artist"}],
                "album": {
                    "name": "Test Album",
                    "images": [{"url": "http://testimage.com"}]
                },
                "external_urls": {"spotify": "http://spotify.com/testtrack"}
            }
        ]
    }

    response = client.get('/top-tracks?access_token=fake_token')

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Top tracks fetched successfully!"
    assert len(data["tracks"]) == 1
    assert data["tracks"][0]["name"] == "Test Song"