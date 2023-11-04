const { createEmbed } = require('../../../labscore/utils/embed')
const { format } = require('../../../labscore/utils/ansi')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { inferkit } = require('../../../labscore/api')
const { codeblock } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'inferkit',
  aliases: ['complete'],
  label: 'text',
  metadata: {
    description: 'Uses InferKit to generate text from a small input snippet.',
    description_short: 'AI text generation',
    examples: ['complete The Fitness Gram Pacer'],
    category: 'fun',
    usage: 'inferkit <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if (!args.text) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (text).`))
    try {
      let res = await inferkit(context, args.text)
      return editOrReply(context, createEmbed("default", context, {
        description: codeblock("ansi", [format(res.response.body.input, "cyan") + res.response.body.output]),
        footer: {
          iconUrl: STATICS.inferkit,
          text: `InferKit • ${context.application.name} • Took ${res.timings}s`
        }
      }))
    } catch (e) {
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to generate text.`))
    }
  }
};