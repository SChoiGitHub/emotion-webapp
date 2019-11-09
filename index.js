const express = require('express')
var path = require('path');
var bodyParser = require("body-parser");

const recorder = require('node-record-lpcm16');
const fs = require('fs');


const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "/public")));



app.get('/', function (req, res) {  
    res.render('index')
  })

app.get('*', function(req, res) { 
     res.render('error');
    });

app.post("/speak", function(req,res){
        console.log('speak reached');

        const file = fs.createWriteStream('test.wav', { encoding: 'binary' })
 
        record.start().pipe(file)

      // Stop recording after three seconds
      setTimeout(function () {
        record.stop()
      }, 3000)



        res.redirect('/');
    });

   
app.listen(9030)