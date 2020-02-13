const users = require('./users');
const term = require( 'terminal-kit' ).terminal ;

const capacity = 500;
const allowed = {};

const current = () => Object.keys(allowed).length;
var deniedCount = [0,0,0,0,0] ;
var allowedInCount = [0,0,0,0,0];
const userTypeCount = [0,0,0,0,0];

var maxCapacityDetected = 0;

// Count the number of visitors, subscribers, etc
for (key in users) {
  ++userTypeCount[users[key]];
}

term.moveTo(1, 10, `1:Visitor (${userTypeCount[1]}) | 2:Registered User (${userTypeCount[2]}) | 3: Library (${userTypeCount[3]}) | 4: Subscriber (${userTypeCount[4]})`);

// Determine a TTL based upon the type of user. Subscribers get a long TTL than visitors.
const getTTL = (userType) => {
  return Math.floor(Math.exp(userType)) + 10; 
};

// Deny a user access to the site
const deny = (userKey, weighting) => {
  const type = users[userKey];
  ++deniedCount[type];
  term.moveTo(1,3, `Denying access to user: ${userKey} (${weighting})`).eraseLineAfter();
  term.moveTo(60, 3, `Denied count: 1:${deniedCount[1]} - 2:${deniedCount[2]} - 3:${deniedCount[3]} - 4:${deniedCount[4]}`)
  return false;
};

// Manage the TTL. Called each second so we can simple decrement the TTL. If it's zero, evict the user!
const manageTtl = () => {
  for (const userKey in allowed) {
    if (--allowed[userKey] === 0) {
      term.moveTo(1,4, `TTL expired for user: ${userKey}`).eraseLineAfter();
      delete allowed[userKey]
    }
  }
};

const showCapacity = () => {
  const c = current();

  if (c > maxCapacityDetected) maxCapacityDetected = c;

  term.moveTo(1,1, `${Math.floor(c / capacity * 100)}% of capacity used. ${c} of ${capacity} allowed. Max ever: ${maxCapacityDetected}`).eraseLineAfter();

};

// User request access
const requestAccess = (userKey) => {

  // if already in, the continue to allow them access
  if (allowed[userKey]) {
    term.moveTo(1,2, `User: ${userKey} already in!`).eraseLineAfter();
    term.moveTo(50, 2, `In count: 1:${allowedInCount[1]} - 2:${allowedInCount[2]} - 3:${allowedInCount[3]} - 4:${allowedInCount[4]}`);

    // reset the TTL for this user - still using the site. 
    allowed[userKey] = getTTL(users[userKey]);

    return true;
  }

  // If we are full, deny access
  const currentlyIn = current();
  const fullRatio = currentlyIn / capacity;
  const weighting = (1 - fullRatio) * users[userKey] * 10;

  if (current() === capacity || weighting < 0.3) return deny(userKey, weighting);

  // If not full, add the user to allowed in list and set the TTL
  const ttl = getTTL(users[userKey]);

  allowed[userKey] = ttl;
  ++allowedInCount[users[userKey]];
  term.moveTo(1,2, `Allowing access to user: ${userKey}`).eraseLineAfter();
  term.moveTo(40, 2, `1:${allowedInCount[1]} - 2:${allowedInCount[2]} - 3:${allowedInCount[3]} - 4:${allowedInCount[4]}`);

  return true;
};

setInterval(manageTtl, 1000);
setInterval(showCapacity, 1000);

module.exports = {
  requestAccess
};