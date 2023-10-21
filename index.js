const { ClusterManager } = require('detritus-client');
const { basecamp } = require('./labscore/logging');

const time = Date.now();

const token = process.env.token;

let client = `../${__dirname}/labscore/client.js`
if(process.env.environment == "local") client = `${__dirname}/labscore/client.js`

const SHARDS = process.env.SHARDS || 2;
const SHARDS_PER_CLUSTER = process.env.SHARDS_PER_CLUSTER_OVERRIDE || 2;

const manager = new ClusterManager(client, token, {
  shardCount: SHARDS,
  shardsPerCluster: SHARDS_PER_CLUSTER,
});

(async () => {
  console.log(`v2 | starting v2.`)

  // Logging
  manager.on("clusterProcess", ({ clusterProcess }) => {
    clusterProcess.on('close', ({code, signal}) => {
      basecamp(`<:ico_w4:1086624964284788787>\`[${process.env.HOSTNAME}]\` **\` CLUSTER_CLOSED  \`**  Cluster ${clusterProcess.clusterId} closed with code \`${code}\` and signal \`${signal}\` @ \`${Date.now()}\``)
    });
    clusterProcess.on('warn', async ({error}) => {
      await basecamp(`<:ico_w2:1086624961025810485>\`[${process.env.HOSTNAME}]\` **\` CLUSTER_WARNING  \`**  Cluster ${clusterProcess.clusterId} issued warning @ \`${Date.now()}\``)
      await basecamp(`\`\`\`js\n${error}\`\`\``)
    });
  })
  
  await manager.run();
  console.log(`v2 | ready. took ${(Date.now() - time) / 1000}.`)
})();