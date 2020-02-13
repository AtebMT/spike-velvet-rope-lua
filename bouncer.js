const term = require( 'terminal-kit' ).terminal ;
const redis = require("redis");

// # Ensure we fill the cache with users
require('./users');
    
const currentUsersCache = redis.createClient('redis://localhost:6379/1');
const allUsersCache = redis.createClient('redis://localhost:6379/0');

const capacity = 500;

const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e6;

let requestPerSecCounter = 0;
let totalRequestsCounter = 0;
let requestDurationTotal = 0;

const profile = async (func) => {
    const start = process.hrtime();
    const returnVal = await func();
    const end = process.hrtime(start);

    const timeInMilliSecs = (end[0] * NS_PER_SEC + end[1]) / MS_PER_NS;
    
    requestDurationTotal += timeInMilliSecs;

    term.moveTo(1, 11, `Time to process request: ${timeInMilliSecs}ms. Avg: ${requestDurationTotal / ++ totalRequestsCounter}ms `);
    
    return returnVal;
}

const getFromUserCache = async (key) => {
  return new Promise((resolve, reject)=> {
    return allUsersCache.get(key, (err, reply) => {
      if (err) return reject(err);

      return resolve(reply);
    });
  });
};

const current = async () => {
  return new Promise((resolve, reject)=> {
    return currentUsersCache.dbsize((err, reply) => {
      if (err) return reject(err);

      return resolve(reply);
    });
  });
}

const get = async (key) => {
  return new Promise((resolve, reject)=> {
    return currentUsersCache.get(key, (err, reply) => {
      if (err) return reject(err);

      return resolve(reply);
    });
  });
}

var deniedCount = [0,0,0,0,0] ;
var allowedInCount = [0,0,0,0,0];

var maxCapacityDetected = 0;

// Determine a TTL based upon the type of user. Subscribers get a long TTL than visitors.
const getTTL = (userType) => {
  return Math.floor(Math.exp(userType)) + 10; 
};

// Deny a user access to the site
const deny = async (userKey, weighting) => {
  const type = await getFromUserCache(userKey);
  ++deniedCount[type];
  term.moveTo(1,3, `Denying access to user: ${userKey} (${weighting})`).eraseLineAfter();
  term.moveTo(60, 3, `Denied count: 1:${deniedCount[1]} - 2:${deniedCount[2]} - 3:${deniedCount[3]} - 4:${deniedCount[4]}`)
  return false;
};

const showCapacity = async () => {
  const c = await current();

  if (c > maxCapacityDetected) maxCapacityDetected = c;

  term.moveTo(1,1, `${Math.floor(c / capacity * 100)}% of capacity used. ${c} of ${capacity} allowed. Max ever: ${maxCapacityDetected}`).eraseLineAfter();

};

// User request access
const requestAccess = async (userKey) => {
  ++requestPerSecCounter;
  return profile(async () => {
    const alreadyIn = await get(userKey);
    const userType = await getFromUserCache(userKey);

    // if already in, the continue to allow them access
    if (alreadyIn) {
      setTimeout(() => {
        term.moveTo(1,2, `User: ${userKey} already in!`).eraseLineAfter();
        term.moveTo(60, 2, `In count: 1:${allowedInCount[1]} - 2:${allowedInCount[2]} - 3:${allowedInCount[3]} - 4:${allowedInCount[4]}`);
      }, 0);

      // reset the TTL for this user - still using the site. 
      currentUsersCache.set(userKey, 'ok', 'EX',  getTTL(userType));

      return true;
    }

    // If we are full, deny access
    const currentlyIn = await current();
    const fullRatio = currentlyIn / capacity;
    const weighting = (1 - fullRatio) * userType * 10;

    if (current() === capacity || weighting < 0.3) return deny(userKey, weighting);

    // If not full, add the user to allowed in list and set the TTL
    const ttl = getTTL(userType);

    currentUsersCache.set(userKey, 'ok', 'EX',  ttl);

    setTimeout(() => {
      ++allowedInCount[userType];
      term.moveTo(1,2, `Allowing access to user: ${userKey}`).eraseLineAfter();
      term.moveTo(60, 2, `In count: 1:${allowedInCount[1]} - 2:${allowedInCount[2]} - 3:${allowedInCount[3]} - 4:${allowedInCount[4]}`);
    }, 0);

    return true;
  });
}

setInterval(async() => showCapacity(), 1000);

setInterval(() => {
  term.moveTo(1, 12, `Requests per sec: ${requestPerSecCounter}`).eraseLineAfter();
  requestPerSecCounter = 0;
}, 1000);

setInterval(async() => {
  // Count the number of visitors, subscribers, etc

  const visitors = await getFromUserCache('visitors');
  const registered = await getFromUserCache('registered');
  const libraries = await getFromUserCache('libraries');
  const subscribers = await getFromUserCache('subscribers');

  term.moveTo(1, 10, `1:Visitor (${visitors}) | 2:Registered User (${registered}) | 3: Library (${libraries}) | 4: Subscriber (${subscribers})`);
}, 1000);

module.exports = {
  requestAccess
};