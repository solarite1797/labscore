const { ClusterManager } = require('detritus-client');
const superagent = require('superagent')

const { basecamp } = require('#logging');

const time = Date.now();
const token = process.env.token;

// Get the correct path for each environment type
let client = "./labscore/client.js"
if(process.env.PATH_OVERRIDE) client = process.env.PATH_OVERRIDE;

const SHARDS = process.env.SHARDS || 2;
const SHARDS_PER_CLUSTER = process.env.SHARDS_PER_CLUSTER_OVERRIDE || 2;

const manager = new ClusterManager(client, token, {
  shardCount: SHARDS,
  shardsPerCluster: SHARDS_PER_CLUSTER,
});

(async () => {
  console.log(`[${process.env.HOSTNAME || "labscore"}] launching bot`)

  // Logging
  manager.on("clusterProcess", ({ clusterProcess }) => {
    clusterProcess.on('close', ({code, signal}) => {
      basecamp(`<:ico_w4:1086624964284788787>\`[${process.env.HOSTNAME || "labscore"}]\` **\` CLUSTER_CLOSED  \`**  Cluster ${clusterProcess.clusterId} closed with code \`${code}\` and signal \`${signal}\` @ \`${Date.now()}\``)
    });
    clusterProcess.on('warn', async ({error}) => {
      await basecamp(`<:ico_w2:1086624961025810485>\`[${process.env.HOSTNAME || "labscore"}]\` **\` CLUSTER_WARNING  \`**  Cluster ${clusterProcess.clusterId} issued warning @ \`${Date.now()}\``)
      await basecamp(`\`\`\`js\n${error}\`\`\``)
    });
  })
  
  await manager.run();
  console.log(`[${process.env.HOSTNAME || "labscore"}] bot ready. took ${(Date.now() - time) / 1000}.`)
  
  // This is kind of a hack.
  // Our current deployment system has a tendency to launch the bot twice, this "ensures" that
  // incorrect instances close again. This should *probably* just be moved to dirigent instead.
  if(process.env.PB_MANAGER_HOST){
    let liveDeploy = await superagent.get(`${process.env.PB_MANAGER_HOST}_pbs/v1/GetPbServiceId`)
    if(process.env.HOSTNAME !== liveDeploy.body.d){
      console.log(`[${process.env.HOSTNAME}] invalid deployment session`)
      process.exit();
    }
  }
})();