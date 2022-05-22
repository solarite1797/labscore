const { format } = require('../../../labscore/utils/ansi')
const { codeblock, icon } = require('../../../labscore/utils/markdown')
const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

module.exports = {
  name: 'guildicon',
  aliases: ["servericon","gi","si"],
  metadata: {
    description: 'server icon',
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