const express = require('express')
var path = require('path');
const app = express()
const axios = require('axios')
const multer = require('multer')
const upload = multer({storage: multer.memoryStorage()})


function getEmotionData(filename){
  return new Promise((resolve,reject) => {
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
    blobStream.on('error', err => {
      reject("error")
    });
    
    blobStream.on('finish', () => {
      axios.get(format(`http://vokaturi-dot-emotionwebapp.appspot.com/vokaturi/${bucket.name}/${blob.name}`))
      .then(response => {
        resolve(response.data)
      })
      .catch(() =>{
        reject("error")
      })
    });

    blobStream.end(req.file.buffer);
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
