from flask import Flask, escape, request, jsonify
from os import environ, path
from scipy.io.wavfile import read as wav_read
import sys
sys.path.append(path.join(environ["OPENVOKATURI_PATH"],"api"))
import Vokaturi


try:
    Vokaturi.load(path.join(environ["OPENVOKATURI_PATH"],"lib/open/linux/OpenVokaturi-3-3-linux64.so"))
except:
    sys.exit(0)

app = Flask(__name__)

def getProbabilities(wav_file):
    (sample_rate, samples) = wav_read(wav_file)
    buffer_length = len(samples)
    c_buffer = Vokaturi.SampleArrayC(buffer_length)
    if samples.ndim == 1:
        c_buffer[:] = samples[:] / 32768.0
    else:
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
    return data

@app.route('/vokaturi/<path:wav_file>')
def vokaturi(wav_file):
    return jsonify(getProbabilities(wav_file))