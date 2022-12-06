const { format } = require('../../../labscore/utils/ansi')
const { codeblock, icon } = require('../../../labscore/utils/markdown')
const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

module.exports = {
  description: 'ping!',
  name: 'ping',
  metadata: {
    description: 'Displays information about the bots connection to discord..',
    examples: ['ping'],
    category: 'core',
    usage: 'ping'
  },
  run: async (context) => {
    context.triggerTyping();
    ping = await context.client.ping()
    editOrReply(context, {
      content: "",
      embeds: [createEmbed("default", context, {
        description: `${icon("connection")} **Bot Latency**\n` + codeblock("ansi", [`rest      ${format(`${ping.rest}ms`, "m")}`, `gateway   ${format(`${ping.gateway}ms`, "m")}`])
      })]
    })
  },
};