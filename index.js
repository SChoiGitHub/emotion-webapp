const express = require('express')
var path = require('path');

const recorder = require('node-record-lpcm16')
const fs = require('fs')

const app = express()

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded())

app.get('/', function (req, res) {  
    res.render('index')
  })

app.get('*', function(req, res) { 
     res.render('error');
    });

app.post("/speak", function(req,res){
        console.log('speak reached');

        const file = fs.createWriteStream('test.wav', { encoding: 'binary' })
 
        recorder.record({
        sampleRate: 44100
        })
        .stream()
        .pipe(file)

        res.redirect('/');
    });

   
app.listen(9010)