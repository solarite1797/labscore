const { createEmbed } = require('../../../labscore/utils/embed')
const { format } = require('../../../labscore/utils/ansi')
const { editOrReply } = require('../../../labscore/utils/message')

const superagent = require('superagent')
const { codeblock } = require('../../../labscore/utils/markdown')

module.exports = {
  name: 'ask',
  label: 'text',
  metadata: {
    description: 'Ask AI questions. May not be accurate.',
    description_short: 'AI questions',
    examples: ['ask How many otter species are there?'],
    category: 'fun',
    usage: 'ask <prompt>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})
    try{
      let res = await superagent.get(`${process.env.AI_SERVER}/ask`)
      .query({
        prompt: args.text
      })
      return editOrReply(context, {embeds:[createEmbed("default", context, {
        description: codeblock("ansi", [format(args.text, "cyan") + res.body.text])
      })]})
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate text.`)]})
    }
  }
};