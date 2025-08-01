from flask import Blueprint, request, jsonify
from openai import OpenAI
import os
import json
import asyncio
import httpx

openai_bp = Blueprint("openai", __name__)

@openai_bp.route('/analyze-mood', methods=['POST'])
def analyze_mood():
    data = request.get_json()
    lyrics = data.get("lyrics")

    if not lyrics:
        return jsonify({"error": "Lyrics missing in request body"}), 400
    
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        prompt = prompt = f"""Please analyze the following song lyrics and respond in this exact JSON format:
{{
  "summary": "<one-sentence mood summary>",
  "tag": "<choose one from: happy, sad, angry, relaxed, energetic, melancholic>"
}}

Lyrics:
{lyrics}
"""
        response = client.chat.completions.create(
            model = "gpt-3.5-turbo",
            messages = [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        print("OpenAI raw response:", response.choices[0].message.content.strip())

        raw = response.choices[0].message.content.strip()

        try:
            parsed = json.loads(raw)
            return jsonify({
                "mood_summary": parsed.get("summary", "No summary"),
                "mood_tag": parsed.get("tag", "unspecified")
            })
        except json.JSONDecodeError:
            return jsonify({
                "error": "OpenAI response not in valid JSON format.",
                "raw_response": raw
            }), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@openai_bp.route('/overall-mood', methods = ['POST'])
def overall_mood():
    data = request.get_json()
    summaries = data.get("summaries", [])

    if not summaries or not isinstance(summaries, list):
        return jsonify({"error": "Missing or invalid 'summaries' list"}), 400

    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        prompt = f""""Here are 20 emotional mood summaries of songs:\n\n{chr(10).join(summaries)}\n\nSummarize the overall emotional mood in one sentence."""

        response = client.chat.completions.create(
            model = "gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt} 
            ]
        )

        print("OpenAI raw response:", response.choices[0].message.content.strip())

        overall = response.choices[0].message.content.strip()

        return jsonify({ "overall_mood": overall })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500