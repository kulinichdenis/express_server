var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var read = require('node-readability');
var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://readerkulinich.firebaseio.com/");

var app = express();    
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

function getLocation(href) {
    return href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
}

app.route('/scraper')
.post(function(req, res) {
  var obj = req.body['url'];

   if(!obj){    
     return res.status(400).send('Bad request');
   } 
  
   if(typeof obj === 'string'){
     if(!getLocation(obj)){      
      return res.status(500).send('Bad Url');  
   }}
  read(obj, function(err, article, meta) {
   
  var hopperRef = myFirebaseRef.child("articles");
    hopperRef.push({"title":article.title,
      "content":article.content, 
      "url": obj,
      "read":false              
  });   
  
    res.sendStatus(res.statusCode);  
    article.close();
//   myFirebaseRef.child("articles").once("value", function(snapshot) {  
          
//           res.status(200).json({
//           title:snapshot.val()['title'],    
//           content: snapshot.val()['content']});
     
//       }, function (errorObject) {
//           console.log("The read failed: " + errorObject.code);
//    });       
});
  
})

.get(function(req, res){ 
    read(req.query.url, function(err, article, meta) {
    if(req.query.callback){
      res.status(200).jsonp({
        url:req.query.url,
        title:article.title, 
        content: article.content});  
   } else {
     res.status(200).json({
       url:req.query.url,
       title:article.title, 
       content: article.content});  
  }  
    article.close();
  });   
})
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})



