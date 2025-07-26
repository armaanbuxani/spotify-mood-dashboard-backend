import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './Login';
import MoodPieChart from './components/MoodPieChart'

function App() {
  const [accesstoken, setAccessToken] = useState('');
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState('');
  const [activeLyrics, setActiveLyrics] = useState(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [moodSummaries, setMoodSummaries] = useState([]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [loadingMood, setLoadingMood] = useState(false);
  const [overallMood, setOverallMood] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl && !accesstoken) {
      localStorage.setItem('spotify_access_token', tokenFromUrl);
      setAccessToken(tokenFromUrl);
      window.history.replaceState({}, document.title, '/'); // clean URL
    } else {
      const storedToken = localStorage.getItem('spotify_access_token');
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }
  }, []);

  useEffect(() => {
    if (!accesstoken) return;

    axios.get(`http://localhost:5000/top-tracks?access_token=${accesstoken}`)
      .then((res) => {
        setTracks(res.data.tracks)
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch tracks.')
      });
  }, [accesstoken]);

  const fetchLyrics = async (track, artist) => {
    setActiveLyrics({
      track,
      artist,
      lyrics: null,
    });

    setLoadingLyrics(true);
    try {
      const res = await axios.get(`http://localhost:5000/lyrics?track=${encodeURIComponent(track)}&artist=${encodeURIComponent(artist)}`);
      setActiveLyrics({
        track,
        artist,
        lyrics: res.data.lyrics,
      });
    } catch (err) {
      console.error("Lyrics fetch error:", err);
      setActiveLyrics({
        track,
        artist,
        lyrics: "Lyrics not found or failed to load.",
      });
    } finally {
      setLoadingLyrics(false);
    }
  };

  const handleShowMoodSummary = async () => {
    setLoadingMood(true);
    setShowMoodModal(true);

    try {
      const lyricsResults = await Promise.all(
        tracks.map(async (track) => {
          try {
            const res = await axios.get(
              `http://localhost:5000/lyrics?track=${encodeURIComponent(track.name)}&artist=${encodeURIComponent(track.artist)}`
            );
            return {
              track,
              lyrics: res.data.lyrics,
            };
          } catch (err) {
            console.error(`Lyrics fetch error for ${track.name}`, err);
            return {
              track,
              lyrics: null,
              error: true,
            };
          }
        })
      );

      const moodResults = await Promise.all(
        lyricsResults.map(async ({ track, lyrics, error }) => {
          if (error || !lyrics) {
            return {
              track: track.name,
              artist: track.artist,
              summary: "Failed to analyze mood.",
              tag: "unknown",
            };
          }

          try {
            const moodRes = await axios.post("http://localhost:5000/analyze-mood", {
              lyrics,
            });

            return {
              track: track.name,
              artist: track.artist,
              summary: moodRes.data.mood_summary,
              tag: moodRes.data.mood_tag,
            };
          } catch (err) {
            console.error(`Mood analysis error for ${track.name}`, err);
            return {
              track: track.name,
              artist: track.artist,
              summary: "Failed to analyze mood.",
              tag: "unknown",
            };
          }
        })
      );

      setMoodSummaries(moodResults);

      const allSummaries = moodResults.map((m) => m.summary);
      const res = await axios.post("http://localhost:5000/overall-mood", {
        summaries: allSummaries,
      });
      setOverallMood(res.data.overall_mood);
    } catch (err) {
      console.error("Unexpected error in mood summary process", err);
      setOverallMood("Could not generate mood summary.");
    }

    setLoadingMood(false);
  };

  if (!accesstoken) {
    return <Login />
  }

  return (
    <div style={{
      backgroundColor: '#121212',
      minHeight: '100vh',
      padding: '40px',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div className="container" style={{ color: 'white' }}>
        <h1 style={{ textAlign: 'center', color: '#1DB954' }}>Top 20 Spotify Tracks</h1>

        {/* Mood Summary Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button
            onClick={handleShowMoodSummary}
            style={{
              backgroundColor: '#1DB954',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Show Mood Summary
          </button>
        </div>

        {/* Error Message */}
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        {/* Track Cards */}
        {tracks.map((track, index) => (
          <div
            key={index}
            className="track-card"
            style={{
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1DB954',
              padding: '15px',
              borderRadius: '8px',
              color: 'black',
              flexWrap: 'wrap',
            }}
          >
            {/* Left Side: Image + Info */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={track.image}
                alt="album art"
                width="80"
                height="80"
                style={{ marginRight: '20px', borderRadius: '6px' }}
              />
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>
                  {index + 1}. {track.name}
                </p>
                <p style={{ margin: 0, fontSize: '16px' }}>{track.album}</p>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#4d4d4d' }}>
                  {track.artist}
                </p>
              </div>
            </div>

            {/* Right Side: Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#191414',
                  color: 'white',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textAlign: 'center',
                }}
              >
                ▶️ Play
              </a>
              <button
                onClick={() => fetchLyrics(track.name, track.artist)}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#191414',
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Show Lyrics
              </button>
            </div>
          </div>
        ))}

        {/* Lyrics Modal */}
        {activeLyrics && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              padding: '20px',
              borderRadius: '10px',
              width: '80%',
              maxHeight: '80%',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              <h2 style={{ marginTop: 0 }}>{activeLyrics.track} — {activeLyrics.artist}</h2>

              {loadingLyrics ? (
                <p>Loading lyrics...</p>
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {activeLyrics.lyrics}
                </pre>
              )}

              <button
                onClick={() => setActiveLyrics(null)}
                style={{
                  marginTop: '20px',
                  backgroundColor: '#1DB954',
                  color: '#fff',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Mood Summary Modal */}
        {showMoodModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              padding: '20px',
              borderRadius: '10px',
              width: '80%',
              maxHeight: '80%',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              <h2 style={{ marginTop: 0 }}>Mood Summary</h2>

              {loadingMood ? (
                <p>Analyzing mood for your top tracks...</p>
              ) : (
                <>
                  {/* Overall Mood Summary */}
                  <div style={{
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontStyle: 'italic'
                  }}>
                    <strong>🎵 Overall Mood Summary:</strong> {overallMood}
                  </div>
                  <MoodPieChart moodSummaries={moodSummaries}></MoodPieChart>

                  {/* Individual Mood Summaries */}
                  <ul>
                    {moodSummaries.map((item, index) => (
                      <li key={index} style={{ marginBottom: '15px' }}>
                        <strong>{item.track}</strong> — {item.artist}
                        <br />
                        <em>{item.summary}</em>
                        <br />
                        <span style={{ color: '#1DB954', fontWeight: 'bold' }}>
                          Tag: {item.tag}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <button
                onClick={() => setShowMoodModal(false)}
                style={{
                  marginTop: '20px',
                  backgroundColor: '#1DB954',
                  color: '#fff',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;