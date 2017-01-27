# Penny Auction Server
This server provides infrastructure to simulate a penny auction, like the site
<http://www.quibids.com/>. This server will return information about 10 items
always up for auction. The server allows clients to send PUT requests with
a username to allow someone to "bid" on an item. The server is also configured
to simulate "random betters" to make the auctions appear active. The server
provides a "remote control" API where auctions can be reset (in case everything
stabilizes to SOLD) and the random betters functionality can be enabled and
disabled gracefully.

The penny-auction-server repo has a sister repo for the penny auction client:
<https://github.com/WDI-SEA/penny-auction-client-solution>

Enjoy!

# API
### Auction Information
* GET <pennyauctionserver.herokuapp.com/users>
* GET <pennyauctionserver.herokuapp.com/auctions>
* GET <pennyauctionserver.herokuapp.com/auctions/0>
* PUT <pennyauctionserver.herokuapp.com/auctions/0>
  * body: ```{username: "some username"}```

### Auction Remote Controls
* GET <pennyauctionserver.herokuapp.com/reset>
* GET <pennyauctionserver.herokuapp.com/stop-random-betters>
* GET <pennyauctionserver.herokuapp.com/start-random-betters>

# Random Betters
The server includes a mechanism to simulate activity on all of the auctions.

# What are Penny Auctions?
Penny auctions are websites where expensive items,
like $1,000 TVs or iPads or even small $10 Wal Mart Gift Cards are put up for
auction. Each auction only exists for "a small amount of time." Each auction
starts at a small price and has a minute on the clock. When users bid on an item
the auction price of the item increases by one cent and ten seconds is added to
the clock.

These sites are a total scam. People see expensive items at low auction prices
with short clock times and think they can easily snag a cheap item. The sites
rely on having enough users on the page making enough active bids that each
auction actually lasts for a very long time. Even when the clock hovers around
"zero seconds left" it will stay there for quite a long time because each user
bid will add ten seconds to the clock, basically forever.

Anyways, these sites present a fun and interesting development challenge.

## Licensing
All content is licensed under a CC­BY­NC­SA 4.0 license.
All software code is licensed under GNU GPLv3. For commercial use or alternative licensing, please contact legal@ga.co.

