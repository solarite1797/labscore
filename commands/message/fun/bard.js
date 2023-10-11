const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { canUseLimitedTestCommands, isLimitedTestUser } = require('../../../labscore/utils/testing')
const { STATICS, STATIC_ICONS } = require('../../../labscore/utils/statics');

const superagent = require('superagent')
const { iconPill, smallIconPill, icon } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'bard',
  label: 'text',
  aliases: ['palm2'],
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nTalk to Bard.`,
    description_short: 'Chat with Bard.',
    examples: ['bard How many otter species are there?'],
    category: 'limited',
    usage: 'bard <input> [-prompt <prompt override>]'
  },
  args: [
    { name: 'prompt', default: '', required: false, help: "The starting system prompt." },
    { name: 'temperature', default: 0.25, required: false, help: "Model temperature." },
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.ATTACH_FILES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!canUseLimitedTestCommands(context)) return;
    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})

    let input = args.text;
    
    let prompt = 'You are a friendly chat bot designed to help people.\n- You should always use gender neutral pronouns when possible.\n- Try to keep your responses within 2000-4000 characters. This isn\'t required for more detailed answers.'
    if(args.prompt !== "") prompt = args.prompt

    if(context.message.messageReference) {
      let msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId);
      if(msg.content && msg.content.length) input = msg.content
      else if(msg.embeds?.length) for(const e of msg.embeds) if(e[1].description?.length) { input = e[1].description; break; } 

      prompt = args.text
      if(args.prompt !== "") return editOrReply(context, {embeds:[createEmbed("warning", context, `Prompt parameter is unsupported for message replies.`)]})
    }

    let model = "chat-bison-001"
    if(args.model && isLimitedTestUser(context.user)) model = args.model
    
    let temperature = "0.25"
    if(args.temperature !== 0.25) temperature = parseFloat(args.temperature)

    try{
      await editOrReply(context, createEmbed("ai_bard", context, "Generating response..."))

      let res = await superagent.post(`${process.env.AI_SERVER}/google/palm2`)
        .set({
          Authorization: process.env.AI_SERVER_KEY
        })
        .send({
          prompt,
          input: [input],
          temperature,
          model
        })

      let inputDisplay = args.text
      if(inputDisplay.length >= 50) inputDisplay = inputDisplay.substr(0,50) + '...'

      let description = []
      let files = [];
      
      if(!res.body.output) res.body.output = '[Empty Response]'

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
          description: description.join('\n').substr(),
          footer: {
            text: `This information may be inaccurate or biased • ${context.application.name}`
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