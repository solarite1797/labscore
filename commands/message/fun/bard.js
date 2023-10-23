const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { canUseLimitedTestCommands, isLimitedTestUser } = require('../../../labscore/utils/testing')
const { STATICS, STATIC_ICONS } = require('../../../labscore/utils/statics');

const superagent = require('superagent')
const { iconPill, smallIconPill, icon } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");

const BLOCKED_PHRASES = process.env.BARD_BLOCKLIST.split(';')

module.exports = {
  name: 'bard',
  label: 'text',
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nChat with <:bard:1163200801871765504> Bard.`,
    description_short: 'Chat with Bard.',
    examples: ['bard How many otter species are there?'],
    category: 'limited',
    usage: 'bard <input>'
  },
  args: [],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.ATTACH_FILES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!canUseLimitedTestCommands(context)) return;

    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})

    let input = args.text;
    
    let inputDisplay = args.text.replace(/\n/g, ' ')
    if(inputDisplay.length >= 50) inputDisplay = inputDisplay.substr(0,50) + '...'

    try{
      await editOrReply(context, createEmbed("ai_custom", context, STATIC_ICONS.ai_bard))

      let res = await superagent.post(`${process.env.AI_SERVER}/google/bard`)
        .set({
          Authorization: process.env.AI_SERVER_KEY
        })
        .send({
          input
        })

      let description = []
      let files = [];
      
      if(!res.body.output) return editOrReply(context, {embeds:[createEmbed("error", context, `Bard returned an error. Try again later.`)]}) 

      if(res.body.output.length <= 4000) description.push(res.body.output)
      else {
        files.push({
          filename: `chat.${Date.now().toString(36)}.txt`,
          value: Buffer.from(res.body.output)
        })
      }

      return editOrReply(context, {
        embeds:[createEmbed("defaultNoFooter", context, {
          author: {
            name: inputDisplay,
            iconUrl: STATIC_ICONS.ai_bard_idle
          },
          description: description.join('\n'),
          footer: {
            text: `Bard • This information may be inaccurate or biased`
          }
        })],
        files
      })
    }catch(e){
      if(e.response.body?.message) return editOrReply(context, {embeds:[createEmbed("warning", context, e.response.body.message)]})
      
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate text.`)]})
    }
  }
};