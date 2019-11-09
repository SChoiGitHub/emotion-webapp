const express = require('express')
var path = require('path');
const app = express()


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "/public")));

app.get('/', function (req, res) {
    res.render('index')
})

app.get('*', function(req, res) { 
     res.render('error');
  });

   
app.listen(8080)
