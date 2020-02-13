const sessionManager = require('./sessions');
const term = require( 'terminal-kit' ).terminal ;

term.clear();

const bouncer = require('./bouncer');

setInterval(async () => {
  // For each user wanting accesss
  for (const userKey in sessionManager.sessions) {
    // Ask the bouncer to request access
    try {
      const allowAccess = await bouncer.requestAccess(userKey);

      if (allowAccess) {
        sessionManager.manageSessionRequest(userKey);
      }
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}, 500);