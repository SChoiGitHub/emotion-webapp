const express = require('express')
var path = require('path');
const app = express()
const axios = require('axios')
const Multer = require('multer')
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();

const CLOUD_BUCKET = "gs://emotionwebapp";
const bucket = storage.bucket(CLOUD_BUCKET);

const upload = Multer({ storage: Multer.memoryStorage()})



function getEmotionData(filename){
  return new Promise((resolve,reject) => {
    axios.get("https://vokaturi-dot-emotionwebapp.appspot.com/vokaturi/"+filename)
    .then(response => {
      resolve(response.data)
    })
    .catch(() => {
      reject("error")
    })
  }) 
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "/public")));

app.get('/', function (req, res) {
  res.render('index')
})

app.post('/analyze',upload.single('data'), function (req, res, next) {
  var filename = Date.now().toString()
  const file = bucket.file()
  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    },
    resumable: false
  })
  stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    next(err);
  });
  stream.on('finish', () => {
    getEmotionData(filename)
    .then(r =>{
      res.json(r)
    })
  });
  stream.end(req.file.buffer);
})

app.get('*', function(req, res) { 
  res.render('error');
});

   
app.listen(8080)
