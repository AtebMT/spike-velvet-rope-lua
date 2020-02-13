const getRandomNumber = require('./random');
const term = require( 'terminal-kit' ).terminal ;

const sessions = {};

const addSession = async () => {
  const lengthOfTimeOnSite = getRandomNumber(10, 250);
  const key = `key-${getRandomNumber(1, 1001)}`;

  if (sessions[key]) return;

  sessions[key] = lengthOfTimeOnSite;

  term.moveTo(1,6, `Users trying to get access: ${Object.keys(sessions).length}`).eraseLineAfter();
};

const manageSessionRequest = (key) => {
  if (--sessions[key] === 0) {
    term.moveTo(1,5, `User ${key} has left the site`).eraseLineAfter();
    delete sessions[key]
  }
};

const intervalTime = [100, 70, 50, 10, 50, 70, 100, 200, 300, 500];

var nextIntervalTime = 0;

setInterval(() => {
  nextIntervalTime = ++nextIntervalTime % intervalTime.length;
}, 30000);

function timeout() {
  term.moveTo(1,7, `Adding users at a rate of one every ${intervalTime[nextIntervalTime]}ms`).eraseLineAfter();
  setTimeout(() => {
    addSession();
    timeout();
  }, intervalTime[nextIntervalTime]);
}

timeout();

module.exports = {
  manageSessionRequest,
  sessions
}