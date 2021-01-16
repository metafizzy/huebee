const puppeteer = require('puppeteer');
const getServer = require('../bin/get-server.js');

// start server
const port = 9000;
let server = getServer();
server.listen( port );
console.log(`Server listening on port ${port}`);

( async function() {
  let browser = await puppeteer.launch();
  let page = await browser.newPage();

  await page.goto(`http://localhost:${port}/test/site/index.html`);

  await require('./basics.js')( page );
  await require('./input.js')( page );
  await require('./set-multiples.js')( page );
  await require('./custom-colors.js')( page );
  await require('./css.js')( page );
  await require('./static-open.js')( page );
  await require('./html-init.js')( page );

  await browser.close();
  server.close();

} )();
