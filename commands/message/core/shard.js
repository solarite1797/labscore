const { format } = require('#utils/ansi');
const { createEmbed } = require('#utils/embed')
const { codeblock } = require('#utils/markdown')
const { editOrReply } = require('#utils/message');

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'shard',
  metadata: {
    description: 'Details about the bots connection to this server.',
    description_short: 'Shard information',
    category: 'core',
    usage: 'shard'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.READ_MESSAGE_HISTORY],
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