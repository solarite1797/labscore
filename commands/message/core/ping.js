const { format } = require('#utils/ansi')
const { createEmbed } = require('#utils/embed')
const { codeblock, icon } = require('#utils/markdown')
const { editOrReply } = require('#utils/message')

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  description: 'ping!',
  name: 'ping',
  metadata: {
    description: 'Displays information about the bots connection to discord.',
    description_short: 'Bot connection details',
    category: 'core',
    usage: 'ping'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    context.triggerTyping();
    ping = await context.client.ping()
    editOrReply(context, createEmbed("default", context, {
      description: `${icon("latency")} **Pong!**\n` + codeblock("ansi", [`rest      ${format(`${ping.rest}ms`, "m")}`, `gateway   ${format(`${ping.gateway}ms`, "m")}`])
    }))
  },
};