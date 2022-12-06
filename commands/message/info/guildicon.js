const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

module.exports = {
  name: 'servericon',
  aliases: ["guildicon","gi","si","groupicon"],
  metadata: {
    description: 'Displays the server icon.',
    description_short: 'Server Icon',
    examples: ['gi'],
    category: 'info',
    usage: 'guildicon'
  },
  run: async (context) => {
    context.triggerTyping();
    editOrReply(context, {
      embeds: [createEmbed("default", context, {
        image: {
          url: context.guild.iconUrl + "?size=4096"
        }
      })]
    })
  },
};