var fake_data = require('./fake_data.json');
var express = require('express');
var app = express();
//
// var BASE_AUCTIONS = {
//   [
//     {
//       title:
//       img:
//     }
//   ]
// }
//
// var AUCTIONS = {
//   [
//     {
//       title:'',
//       img:','
//       time_left:
//       price:
//       last_bidder:
//     }
//   ]
// }

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);

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
