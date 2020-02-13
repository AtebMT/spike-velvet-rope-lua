const redis = require("redis");
const redisClient = redis.createClient('redis://localhost:6379/0');

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  
  return array;
}

const indexes = [];

// Get 1000 indexes and suffle them around to a randomised list of the top 1000 ints
for (var i = 1; i <= 1000; i++) {
  indexes.push(i);
}

shuffle(indexes);

const users = {}

var countOfUsers = 0;

// Break down the users by type. We want to distribute users throughout the 1000 that we have
// allocated- so we use the shuffled index array to determine the ID of the user key
// 50% are vistors
for (var i = 1; i <= 500; i++) {
  users[`key-${indexes[i]}`] = 1;
  ++countOfUsers;
}

redisClient.set('visitors', countOfUsers.toString(), (err, reply) => {
  if (err) throw new Error(err);
});

countOfUsers = 0;
// 25% (ish) are registered users
for (var i = 501; i <= 740; i++) {
  users[`key-${indexes[i]}`] = 2;
  ++countOfUsers;
}

redisClient.set('registered', countOfUsers.toString(), (err, reply) => {
  if (err) throw new Error(err);
});

countOfUsers = 0;

// Small number (1%) are libaries
for (var i = 741; i <= 751; i++) {
  users[`key-${indexes[i]}`] = 3;
  ++countOfUsers;
}

redisClient.set('libraries', countOfUsers.toString(), (err, reply) => {
  if (err) throw new Error(err);
});

countOfUsers = 0;

// 25% (ish) are subscribers
for (var i = 752; i <= 1000; i++) {
  users[`key-${indexes[i]}`] = 4;
  ++countOfUsers;
}

redisClient.set('subscribers', countOfUsers, (err, reply) => {
  if (err) throw new Error(err);
});

for (const userKey in users) {
  redisClient.set(userKey, users[userKey]);
};

redisClient.set('test-key', "my value");
module.exports = users;