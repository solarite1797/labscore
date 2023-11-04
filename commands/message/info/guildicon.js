const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'servericon',
  aliases: ["guildicon", "gi", "si", "groupicon"],
  metadata: {
    description: 'Displays the server icon.',
    description_short: 'Server icon',
    category: 'info',
    usage: 'guildicon'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    context.triggerTyping();
    if (!context.guild.iconUrl) return editOrReply(context, createEmbed("warning", context, "Server doesn't have an icon."))
    return editOrReply(context, createEmbed("default", context, {
      image: {
        url: context.guild.iconUrl + "?size=4096"
      }
    }))
  },
};