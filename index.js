const { ClusterManager } = require('detritus-client');
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