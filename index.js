const { ClusterManager } = require('detritus-client');
const { basecamp } = require('./labscore/logging');
const superagent = require('superagent')

const time = Date.now();

const token = process.env.token;

// Get the correct path for each environment type
let client = `../${__dirname}/labscore/client.js`
if(process.env.environment == "local") client = `./labscore/client.js`
if(process.env.environment == "prodnew") client = `./labscore/labscore/client.js`;

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
  
  if(process.env.environment == "prodnew"){
    let liveDeploy = await superagent.get(`${process.env.PB_MANAGER_HOST}_pbs/GetPbServiceId`)
    if(process.env.HOSTNAME !== liveDeploy.body.d){
      console.log(`[${process.env.HOSTNAME}] invalid deployment session`)
      process.exit();
    }
  }
})();