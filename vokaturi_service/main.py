from flask import Flask, escape, request, jsonify
from os import environ, path
from scipy.io.wavfile import read as wav_read
from google.cloud import storage
import sys
import subprocess
import urllib
sys.path.append("./OpenVokaturi/api")
import Vokaturi


storage_client = storage.Client()
bucket = storage_client.get_bucket("emotionwebapp")

try:
    Vokaturi.load("./OpenVokaturi/lib/open/linux/OpenVokaturi-3-3-linux64.so")
except:
    sys.exit(0)

app = Flask(__name__)

def getProbabilities(blob_name):
    local_file = "/tmp/"+blob_name
    wav_file = "/tmp/"+blob_name+".wav"
    _blob = bucket.blob(blob_name)
    _blob.download_to_filename(local_file)
    subprocess.call(['ffmpeg', '-i', local_file, wav_file])

    
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

    subprocess.Popen(['rm', local_file, wav_file])
    return data


@app.route('/vokaturi/<string:blob>')
def vokaturi(blob):
    return getProbabilities(blob)
