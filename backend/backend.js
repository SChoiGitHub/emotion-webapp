const express = require('express')
var path = require('path');
const app = express()
const axios = require('axios')

function getEmotionData(filename){
  return new Promise((resolve,reject) => {
    //TODO: This url will change with deployment
    axios.get("http://localhost:3000/vokaturi/"+filename)
    .then(response => {
      resolve(response)
    })
    .catch(() => {
      reject("error")
    })
  }) 
}

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "/public")));

app.get('/', function (req, res) {
    res.render('index')
})

app.get('*', function(req, res) { 
     res.render('error');
  });

   
app.listen(8080)
