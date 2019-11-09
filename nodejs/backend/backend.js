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



function getEmotionData(blob_name){
  return new Promise((resolve,reject) => {
    const blob = bucket.file(blob_name)
    const blobStream = blob.createWriteStream();

    blobStream.on('err', () => {
      reject({a:"2214"})
    });
    blobStream.on('finish', () => {
      console.log(`https://storage.googleapis.com/`,bucket.name,blob.name);
      resolve({a:"2"})
    });
    blobStream.end(blob_name);
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

app.post('/analyze',upload.single('audio'), function (req, res, next) {
  console.log(req.file)
  getEmotionData(req.file.originalname)
  .then(r =>{
    res.json(r)
  })
})

app.get('*', function(req, res) { 
  res.render('error');
});

   
app.listen(8080)
