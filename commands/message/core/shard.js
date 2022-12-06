const { codeblock } = require('../../../labscore/utils/markdown')
const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message');
const { format } = require('../../../labscore/utils/ansi');

module.exports = {
  name: 'shard',
  metadata: {
    description: 'Details about the bots connection to this server.',
    description_short: 'Shard information',
    examples: ['shard'],
    category: 'core',
    usage: 'shard'
  },
  run: async (context) => {  
    return await editOrReply(context, 
      createEmbed("default", context, {
        description: `${codeblock("ansi", [
          `Shard:   ${format(`${context.shardId + 1}/${context.manager.cluster.shardCount}`, "magenta")}`,
          `Cluster: ${format(`${context.manager.clusterId + 1}/${context.manager.clusterCount}`, "magenta")}`
        ])}`
      })
    )
  },
};