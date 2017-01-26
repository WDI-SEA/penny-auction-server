var auctions = require('./initial_auctions.json');
var fake_data = require('./fake_data.json');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

auctions.forEach(function(auction) {
  var update = getRandomUpdate();
  auction.username = update.username;
  auction.price = update.price;
  auction.seconds_left = update.seconds_left;
  auction.img = "http://pennyauctionserver.herokuapp.com/img/" + auction.img;
  
  bindAuctionItemWithUpdate(auction);
});

function bindAuctionItemWithUpdate(auction_item) {
  var update = getRandomUpdate();
  auction_item.username = update.username;
  auction_item.seconds_left = update.seconds_left;
  incrementItemPrice(auction_item);
  return auction_item;
}

function getRandomItem() {
  var index = Math.floor(Math.random() * auctions.length);
  var item = auctions[index];
  return item;
}

function getRandomUpdate() {
  var index = Math.floor(Math.random() * fake_data.length);
  var choice = fake_data[index];
  return choice;
}

function incrementItemPrice(item) {
  var values = item.price.substr(1).split(".");
  var dollars = values[0];
  var cents = values[1];
  
  dollars = parseInt(dollars, 10);
  cents = parseInt(cents, 10);
  
  cents++;
  
  if (cents === 100) {
    cents = 0;
    dollars++;
  }
  
  if (cents < 10) {
    item.price = "$" + dollars + ".0" + cents;
  } else {
    item.price = "$" + dollars + "." + cents;
  }
  return item;
}

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
app.use(express.static(__dirname + '/static'));

function randomBid() {
  var item = getRandomItem();
  console.log("item was:", item);
  item = bindAuctionItemWithUpdate(item);
  console.log("item now:", item);
  
  setTimeout(randomBid, Math.random() * 2000);
}

setTimeout(randomBid, Math.random() * 2000);

app.get('/auctions', function(req, res) {
  res.send(auctions);
});

app.get('/auctions/:id', function(req, res) {
  var id = parseInt(req.params.id, 10);
  
  if (auctions[id] === undefined) {
    res.send({error: "Unknown auction id: " + id});
  }
  
  var item = auctions[id];
  res.send(item);
});

app.put('/auctions/:id', function(req, res) {
  var username = "GHOST BIDDER";
  if (req.body && req.body.username) {
    username = req.body.username;
  }
  
  var id = parseInt(req.params.id, 10);
  
  if (auctions[id] === undefined) {
    res.send({error: "Unknown auction id: " + id});
  }
  
  var item = auctions[id];
  var saveTime = item.seconds_left;
  item = bindAuctionItemWithUpdate(item);
  item.username = username;
  item.seconds_left = saveTime + 10;
  res.send(item);
});

app.get('/*', function(req, res) {
  res.send({
    error: "Invalid API endpoint."
  });
});

app.listen(process.env.PORT || 3001);
