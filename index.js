const { ClusterManager } = require('detritus-client');

const time = Date.now();

const token = process.env.token;

let client = `../${__dirname}/labscore/client.js`
if(process.env.environment == "local") client = `./labscore/client.js`
const manager = new ClusterManager(client, token, {
  shardCount: 2,
  shardsPerCluster: 2,
});

(async () => {
  console.log(`v2 | starting v2.`)
  await manager.run();
  console.log(`v2 | ready. took ${(Date.now() - time) / 1000}.`)
})();

// TODO: if i decide that this is necessary for something else, move it to a dedicated directory
const express = require('express');
const app = express();

app.get("*", function (request, response) {
  response.send(`🧪 v2 @ ${Date.now()}`);
});

var listener = app.listen(process.env.PORT, function () {
  console.log(`v2 | web server live on port ${listener.address().port}.`);
});