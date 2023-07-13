const { createEmbed } = require('../../../labscore/utils/embed')
const { format } = require('../../../labscore/utils/ansi')
const { editOrReply } = require('../../../labscore/utils/message')

const superagent = require('superagent')
const { codeblock } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'chat',
  label: 'text',
  metadata: {
    description: 'Chat with an AI language model.',
    description_short: 'AI Language Model',
    examples: ['chat How many otter species are there?'],
    category: 'broken',
    usage: 'chat <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    return;
    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})
    try{
      let res = await superagent.get(`${process.env.AI_SERVER}/chat`)
      .query({
        prompt: args.text
      })
      return editOrReply(context, {embeds:[createEmbed("default", context, {
        description: codeblock("ansi", ["👤 " + format(args.text, "cyan") + "\n🤖 " + res.body.text]),
        footer: {
          text: `This information may be inaccurate or biased • ${context.application.name}`
        }
      })]})
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate text.`)]})
    }
  }
};