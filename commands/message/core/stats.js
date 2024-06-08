const { OPEN_SOURCE_REPOSITORY_URL } = require('#constants');

const { createEmbed } = require('#utils/embed');
const { highlight, iconPill, iconLinkPill } = require('#utils/markdown');
const { editOrReply } = require('#utils/message');

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

// TODO: Move this into utils
function format(seconds){
  function pad(s){
    return (s < 10 ? '0' : '') + s;
  }

  var days = Math.floor(seconds / (60*60*24));
  var hours = Math.floor(seconds % (60*60*24) / (60*60));
  var minutes = Math.floor(seconds % (60*60) / 60);
  var seconds = Math.floor(seconds % 60);

  if(days >= 1) return pad(days) + ' Days, ' + pad(hours) + ' Hours, ' + pad(minutes) + ' Minutes, ' + pad(seconds) + ' Seconds'
  if(hours == 0) return pad(minutes) + ' Minutes, ' + pad(seconds) + ' Seconds'
  return pad(hours) + ' Hours, ' + pad(minutes) + ' Minutes, ' + pad(seconds) + ' Seconds'
}

module.exports = {
  name: 'stats',
  aliases: ['usage', 'uptime', 'status'],
  metadata: {
    description: 'Shows statistics about the bot.',
    description_short: 'Bot statistics',
    category: 'core',
    usage: 'stats'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
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
          `${iconPill("home",      "Servers     ")} ${highlight(` ${formatted.guilds} `)}`,
          `${iconPill("robot",     "Shard       ")} ${highlight(` ${context.shardId + 1}/${context.manager.cluster.shardCount} `)}`,
          `${iconPill("latency",   "Memory Usage")} ${highlight(` ${Math.round(formatted.usage / 1024 / 1024)}MB `)}`,
          `${iconPill("clock",     "Uptime      ")} ${highlight(` ${format(process.uptime())} `)}`,
          ``,
          `${iconLinkPill('gitlab', OPEN_SOURCE_REPOSITORY_URL, 'Source Code')} ​ ​ ${iconLinkPill('link', context.application.oauth2UrlFormat({ scope: 'bot applications.commands', permissions: 412317248576 }), `Invite ${context.client.user.username}`).replace("ptb.discordapp.com","discord.com")}`
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
      return editOrReply(context, createEmbed("error", context, "Unable to fetch bot statistics."))
    }
  }
};