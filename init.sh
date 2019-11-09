#Starts up all APIs
env FLASK_APP=./vokaturi_interface/vokaturi.py flask run -h localhost -p 3000 &
node ./backend/backend.js
