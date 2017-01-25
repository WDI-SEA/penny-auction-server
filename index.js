var fake_data = require('./fake_data.json');
var express = require('express');
var app = express();

app.get('/poll_item/:id', function(req, res) {
  // haha, ignore the id and just return whatever.
  var index = Math.floor(Math.random() * fake_data.length);
  var choice = fake_data[index];
  res.send(choice);
});

app.get('/*', function(req, res) {
  res.send({
    error: "Invalid API endpoint."
  });
});

app.listen(process.env.PORT || 3001);
