from flask import Flask, escape, request, jsonify
from os import environ
from scipy.io.wavfile import read as wav_read
import sys
sys.path.append("vokaturi_interface/OpenVokaturi/api")
import Vokaturi


try:
    Vokaturi.load("vokaturi_interface/OpenVokaturi/lib/open/linux/OpenVokaturi-3-3-linux64.so")
except:
    sys.exit(0)

app = Flask(__name__)

@app.route('/vokaturi/<string:wav_file>')
def vokaturi(wav_file):
    (sample_rate, samples) = wav_read("vokaturi_interface/"+wav_file)
    buffer_length = len(samples)
    c_buffer = Vokaturi.SampleArrayC(buffer_length)
    if samples.ndim == 1:  # mono
        c_buffer[:] = samples[:] / 32768.0
    else:  # stereo
        c_buffer[:] = 0.5*(samples[:,0]+0.0+samples[:,1]) / 32768.0
    
    voice = Vokaturi.Voice (sample_rate, buffer_length)
    voice.fill(buffer_length, c_buffer)
    quality = Vokaturi.Quality()
    emotionProbabilities = Vokaturi.EmotionProbabilities()
    voice.extract(quality, emotionProbabilities)
    data = {}
    if quality.valid:
        data["neutral"] = emotionProbabilities.neutrality
        data["happiness"] = emotionProbabilities.happiness
        data["sadness"] = emotionProbabilities.sadness
        data["anger"] = emotionProbabilities.anger
        data["fear"] = emotionProbabilities.fear
    else:
        data["error"] = "Quality Too Low"
    voice.destroy()
    return jsonify(data)