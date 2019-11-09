#Starts up all APIs
env FLASK_APP=./vokaturi_interface/vokaturi.py flask run &
node ./backend/backend.js
