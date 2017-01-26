var BID_DELAY_OFFSET = -3;
var BID_TIME_INCREMENT = 10;
var MAX_SECONDS_LEFT = 30;
var RANDOM_BETTING_DISABLED = false;

var auctions = require('./initial_auctions.json');
var fake_data = require('./fake_data.json');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var betters = {};

function initializeAuctions() {
  auctions.forEach(function(auction) {
    var update = getRandomUpdate();
    auction.username = update.username;
    auction.price = update.price;
    auction.seconds_left = update.seconds_left;
    auction.closed = false;
    // only add the penny auction server prefix the first time
    // the site loads.
    if (auction.img.indexOf("pennyauctionserver") < 0) {
      auction.img = "http://pennyauctionserver.herokuapp.com/img/" + auction.img;
    }
    
    bindAuctionItemWithUpdate(auction);
  });

  betters = {};
}
initializeAuctions();

function bindAuctionItemWithUpdate(item) {
  var saveSeconds = item.seconds_left;
  var update = getRandomUpdate();
  item.username = update.username;
  item.seconds_left = saveSeconds + BID_TIME_INCREMENT;
  item.seconds_left = Math.min(item.seconds_left, MAX_SECONDS_LEFT);
  incrementItemPrice(item);
  return item;
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

function decrementAllAuctionTimes() {
  auctions.forEach(function(item) {
    item.seconds_left--;
    if (item.seconds_left <= 0) {
      item.closed = true;
      item.seconds_left = 0;
    }
  });
}

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    } else {
      next();
    }
};

app.use(allowCrossDomain);
app.use(express.static(__dirname + '/static'));

function randomBid(item) {
  if (RANDOM_BETTING_DISABLED) {
    return;
  }
  if (item.closed) {
    console.log("no bid accepted. item closed.");
    return;
  }

  item = bindAuctionItemWithUpdate(item);
  
  // bid again somewhere in the range of the time left for the item.
  // Add one second to the time left to give a small chance that the
  // bid will end.
  var delay = Math.random() * 1000 * item.seconds_left + BID_DELAY_OFFSET;
  setTimeout(function() {
    randomBid(item);
  }, delay);
}

auctions.forEach(function(item) {
  setTimeout(function() {
    randomBid(item);
  }, Math.random() * 1000 * item.seconds_left);
});

var bettingInterval = setInterval(decrementAllAuctionTimes, 1000);

app.get('/stop-random-betters', function(req, res) {
  RANDOM_BETTING_DISABLED = true;
  res.send(true);
});

app.get('/start-random-betters', function(req, res) {
  RANDOM_BETTING_DISABLED = false;
  res.send(true);
});

app.get('/users', function(req, res) {
  res.send(betters);
});

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

app.get('/auctions/:id/:username', function(req, res) {
  var username = req.params.username;
  userBet(req, res, req.params.id, username);
});

app.put('/auctions/:id', function(req, res) {
  var username = "GHOST BIDDER";
  if (req.body && req.body.username) {
    username = req.body.username;
  }
  
  userBet(req, res, req.params.id, username);
});
  
function userBet(req, res, id, username) {
  var id = parseInt(req.params.id, 10);

  if (auctions[id] === undefined) {
    res.send({error: "Unknown auction id: " + id});
  }

  var item = auctions[id];

  if (item.closed) {
    console.log("user tried to bid on closed auction:", username, item);
    res.send({
      error: "Bid not accepted. Auction closed for item",
      item: item
    });
    return;
  }

  if (betters[username] === undefined) {
    betters[username] = 20;
  }

  if (betters[username] < 0) {
    res.send({error: "No pennies left for user " + username});
  }

  betters[username]--;

  var saveTime = item.seconds_left;
  item = bindAuctionItemWithUpdate(item);
  item.username = username;
  item.seconds_left = saveTime + 10;
  item.seconds_left = Math.max(item.seconds_left, MAX_SECONDS_LEFT);
  res.send({
    item: item,
    user: {
      username: username,
      pennies: betters[username]
    }
  });
};

app.get('/reset', function(req, res) {
  initializeAuctions()
  res.send(auctions);
});

app.get('/*', function(req, res) {
  res.send({
    error: "Invalid API endpoint."
  });
});

app.listen(process.env.PORT || 3001);
