const { highlight, iconPill } = require('../../../labscore/utils/markdown')
const { createEmbed } = require('../../../labscore/utils/embed')

const { editOrReply } = require('../../../labscore/utils/message');

const { Permissions } = require("detritus-client/lib/constants");

function format(seconds){
  function pad(s){
    return (s < 10 ? '0' : '') + s;
  }
  var hours = Math.floor(seconds / (60*60));
  var minutes = Math.floor(seconds % (60*60) / 60);
  var seconds = Math.floor(seconds % 60);

  if(hours == 0) return pad(minutes) + ' Minutes, ' + pad(seconds) + ' Seconds'
  return pad(hours) + ' Hours, ' + pad(minutes) + ' Minutes, ' + pad(seconds) + ' Seconds'
}

module.exports = {
  name: 'stats',
  aliases: ['usage', 'uptime'],
  metadata: {
    description: 'Shows statistics about the bot.',
    description_short: 'Bot statistics',
    examples: ['stats'],
    category: 'core',
    usage: 'stats'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS],
  run: async (context) => {
    context.triggerTyping();
    try{
      if(context.manager){
        const globalStats = await context.manager.broadcastEval((cluster) => {
          const shardUsage = process.memoryUsage();
          
          let stats = {
            usage: shardUsage.heapTotal + shardUsage.external + shardUsage.arrayBuffers,
            guilds: 0
          }
          for (const [shardId, shard] of cluster.shards) {
            stats.guilds += shard.guilds.length;
          }
          return stats
        })

        let formatted = {
          guilds: 0,
          usage: 0
        }

        for (let cid in globalStats) {
          const cstats = globalStats[cid];
          formatted.guilds += cstats.guilds
          formatted.usage += cstats.usage
        }

        const display = [
          `${iconPill("house",      "Servers     ")} ${highlight(` ${formatted.guilds} `)}`,
          `${iconPill("robot",      "Shard       ")} ${highlight(` ${context.shardId + 1}/${context.manager.cluster.shardCount} `)}`,
          `${iconPill("connection", "Memory Usage")} ${highlight(` ${Math.round(formatted.usage / 1024 / 1024)}MB `)}`,
          `${iconPill("timer",      "Uptime      ")} ${highlight(` ${format(process.uptime())} `)}`
        ]

        return editOrReply(context, createEmbed("default", context, {
          description: display.join('\n')
        }))

      } else {
        return editOrReply(context, createEmbed("error", context, "Bot is not running in cluster mode."))
      }

      return;
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds: [createEmbed("error", context, "Unable to fetch bot statistics.")]})
    }
  }
};