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
    description: `Talk to ChatGPT.\n\n<:bonzi:1138585089891106836> He will explore the Internet with you as your very own friend and sidekick! He can talk, walk, and joke like no other friend you've ever had!`,
    description_short: 'Talk to ChatGPT.',
    examples: ['chat How many otter species are there?'],
    category: 'hidden',
    usage: 'chat <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})
    try{
      let res = await superagent.post(`${process.env.AI_SERVER}/chatgpt`)
        .set({
          Authorization: process.env.AI_SERVER_KEY
        })
        .send({
          prompt: "You are a friendly chat bot designed to help people. You should always use gender neutral pronouns when possible.",
          input: [args.text]
        })
      return editOrReply(context, {embeds:[createEmbed("default", context, {
        description: codeblock("ansi", ["👤 " + format(args.text, "cyan") + "\n🤖 " + res.body.output.substr(0, 2000 - args.text.length)]),
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