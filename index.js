const { ClusterManager } = require('detritus-client');
const express = require('express');
const app = express();
const time = Date.now();

const token = process.env.token;

let client = `../${__dirname}/labscore/client.js`
if(process.env.environment == "local") client = `./labscore/client.js`
const manager = new ClusterManager(client, token, {
  shardCount: 2,
  shardsPerCluster: 1,
});

(async () => {
  console.log(`v2 | starting v2.`)
  await manager.run();
  console.log(`v2 | ready. took ${(Date.now() - time) / 1000}.`)
})();

app.get("*", function (request, response) {
  response.send(`🧪 v2 @ ${Date.now()}`);
});

var listener = app.listen(process.env.PORT, function () {
  console.log(`v2 | web server live on port ${listener.address().port}.`);
});