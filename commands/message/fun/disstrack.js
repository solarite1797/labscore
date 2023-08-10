const { createEmbed } = require('../../../labscore/utils/embed')
const { format } = require('../../../labscore/utils/ansi')
const { editOrReply } = require('../../../labscore/utils/message')

const superagent = require('superagent')
const { codeblock, iconPill } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");
const { canUseLimitedTestCommands } = require('../utils/testing')

module.exports = {
  name: 'disstrack',
  label: 'text',
  metadata: {
    description: `${iconPill("fun", "LIMITED TESTING")}\n\nAI Generated Disstracks, powered by ChatGPT`,
    description_short: 'AI generated disstracks.',
    examples: ['disstrack'],
    category: 'limited',
    usage: 'disstrack <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!canUseLimitedTestCommands(context)) return;
    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})
    try{
      let res = await superagent.post(`${process.env.AI_SERVER}/openai`)
        .set({
          Authorization: process.env.AI_SERVER_KEY
        })
        .send({
          prompt: "Write a disstrack about the subject the user supplies. The disstrack should have at least two verses and a chorus.",
          input: [args.text],
          temperature: 0.6,
          model: "CHATGPT"
        })
      return editOrReply(context, {embeds:[createEmbed("default", context, {
        description: codeblock("ansi", [res.body.output.substr(0, 2020)]),
        footer: {
          text: `🗣🗣📢🔥🔥🔥🔥💯 • ${context.application.name}`
        }
      })]})
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate text.`)]})
    }
  }
};