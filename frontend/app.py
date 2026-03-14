from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import pyttsx3
import subprocess
import os
import uuid
from flask_cors import CORS
import sqlite3
import os
import numpy as np
import cv2
import tensorflow as tf
import keras
from werkzeug.utils import secure_filename

# Create Flask app
app = Flask(__name__)

AUDIO_FOLDER = os.path.join("static", "audio")
os.makedirs(AUDIO_FOLDER, exist_ok=True)



# eSpeak path (change if installed elsewhere)
ESPEAK_PATH = r"C:\Program Files\eSpeak NG\espeak-ng.exe"


# ----------------------------
# Windows TTS (Hindi, Tamil)
# ----------------------------
def speak_windows(text, lang_code, filepath):
    if not text:
        raise ValueError("No text provided for speech synthesis")

    engine = pyttsx3.init()
    voices = engine.getProperty("voices")

    if not voices or not isinstance(voices, (list, tuple)):
        raise RuntimeError("No voices available from pyttsx3")

    for voice in voices:
        if lang_code.split("-")[0] in voice.id.lower():
            engine.setProperty("voice", voice.id)
            break

    engine.save_to_file(str(text), filepath)
    engine.runAndWait()
    engine.stop()

# ----------------------------
# eSpeak TTS (Telugu, Kannada, Bengali, Marathi)
# ----------------------------
def speak_espeak(text, lang_code, filepath):
    espeak_lang_map = {
        "te-IN": "te",
        "kn-IN": "kn",
        "bn-IN": "bn",
        "mr-IN": "mr",
    }

    result = subprocess.run(
        [
            ESPEAK_PATH,
            "-v", espeak_lang_map.get(lang_code, "en"),
            "-w", filepath,
            text
        ],
        cwd=r"C:\Program Files\eSpeak NG",  # 👈 IMPORTANT
        capture_output=True,
        text=True
    )

    print("STDERR:", result.stderr)

# ----------------------------
# Route: Generate Speech
# ----------------------------
@app.route("/speak", methods=["POST"])
def speak():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    text = data.get("text")
    lang = data.get("lang")

    if not text or not lang:
        return jsonify({"error": "Missing text or language"}), 400

    filename = f"{uuid.uuid4()}.wav"
    filepath = os.path.join(AUDIO_FOLDER, filename)

    try:
        if lang in ["hi-IN", "ta-IN"]:
            speak_windows(text, lang, filepath)
        elif lang in ["te-IN", "kn-IN", "bn-IN", "mr-IN"]:
            speak_espeak(text, lang, filepath)
        else:
            speak_windows(text, "en-IN", filepath)

        return jsonify({"audio_url": f"/static/audio/{filename}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

CORS(app, resources={r"/*": {"origins": "*"}})
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load your trained model
try:
    model = keras.models.load_model("eye_website.h5")
    print("Model loaded successfully!")
except Exception as e:
    print(f"Model load error: {e}")

def init_db():
    conn = sqlite3.connect('optiplus.db')
    cursor = conn.cursor()
    # Corrected table schema to match the data being sent
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            email TEXT PRIMARY KEY,
            full_name TEXT,
            phone TEXT,
            age INTEGER,
            has_eye_issues INTEGER,
            left_eye TEXT,
            right_eye TEXT,
            eye_condition TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS eye_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            diagnosis TEXT,
            severity TEXT,
            power TEXT,
            acuity TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES profiles (email)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def home():
    return "Eye Care Prediction API is running!"

@app.route('/save_profile', methods=['POST'])
def save_profile():
    try:
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "Invalid JSON"}), 400

        profile = {
            "email": data.get("email"),
            "full_name": data.get("fullName"),
            "phone": data.get("phone"),
            "age": data.get("age"),
            "has_eye_issues": data.get("hasEyeIssues", 0),
            "left_eye": data.get("leftEye", "0.00"),
            "right_eye": data.get("rightEye", "0.00"),
            "eye_condition": data.get("eyeCondition", "None")
        }

        conn = sqlite3.connect('optiplus.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO profiles 
            (email, full_name, phone, age, has_eye_issues, left_eye, right_eye, eye_condition)
            VALUES (:email, :full_name, :phone, :age, :has_eye_issues, :left_eye, :right_eye, :eye_condition)
        ''', profile)

        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Profile saved!"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({"prediction": "No file uploaded"}), 400
        
        img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({"error": "Invalid image file"}), 400

        img = cv2.resize(img, (224,224)) / 255.0
        img = np.expand_dims(img, axis=0)

        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        prediction = model.predict(img)

        label = "Healthy Eye" if prediction[0][0] > 0.5 else "Diseased Eye"

        details = {
            "Healthy Eye": "Your eye appears healthy. Keep regular checkups.",
            "Diseased Eye": "Your eye may have issues. Consult an eye specialist."
        }

        return jsonify({
            "prediction": label,
            "details": details[label]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
