const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { canUseLimitedTestCommands, isLimitedTestUser } = require('../../../labscore/utils/testing')
const { STATIC_ICONS } = require('../../../labscore/utils/statics');

const superagent = require('superagent')
const { iconPill, stringwrap } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'palm',
  label: 'text',
  aliases: ['palm2'],
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nTalk to <:palm2:1163200685177839666> PaLM 2.`,
    description_short: 'Chat with PaLM 2.',
    examples: ['palm How many otter species are there?'],
    category: 'limited',
    usage: 'palm <input> [-prompt <prompt override>]'
  },
  args: [
    { name: 'prompt', default: '', required: false, help: "The starting system prompt." },
    { name: 'temperature', default: 0.25, required: false, help: "Model temperature." },
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.ATTACH_FILES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!canUseLimitedTestCommands(context)) return;

    context.triggerTyping();
    if(!args.text) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (text).`))

    let input = args.text;
    
    let prompt = `You are a friendly chat bot designed to help people.\n- Today\'s date is ${new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"long", day:"numeric"})}\n- You should always use gender neutral pronouns when possible.\n- When answering a question, be concise and to the point.\n- Try to keep responses below 1000 characters. This does not apply to subjects that require more exhaustive or in-depth explanation.`
    if(args.prompt !== "") prompt = args.prompt

    // Get content if the user replies to anything
    if(context.message.messageReference) {
      let msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId);

      if(msg.content && msg.content.length) input = msg.content
      else if(msg.embeds?.length) for(const e of msg.embeds) if(e[1].description?.length) { input = e[1].description; break; } 

      prompt = args.text
      if(args.prompt !== "") return editOrReply(context, createEmbed("warning", context, `Prompt parameter is unsupported for message replies.`))
    }

    let model = "chat-bison-001"
    if(args.model && isLimitedTestUser(context.user)) model = args.model
    
    let temperature = "0.25"
    if(args.temperature !== 0.25) temperature = parseFloat(args.temperature)

    try{
      await editOrReply(context, createEmbed("ai_custom", context, STATIC_ICONS.ai_palm_idle))

      let res = await superagent.post(`${process.env.AI_SERVER}/google/palm2/chat`)
        .set({
          Authorization: process.env.AI_SERVER_KEY
        })
        .send({
          prompt,
          input: [input],
          temperature,
          model
        })

      let description = []
      let files = [];
      
      if(!res.body.output) return editOrReply(context, createEmbed("error", context, `PaLM 2 returned an error. Try again later.`)) 

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
            name: stringwrap(prompt, 50, false),
            iconUrl: STATIC_ICONS.ai_palm_idle
          },
          description: description.join('\n'),
          footer: {
            text: `PaLM 2 • This information may be inaccurate or biased`
          }
        })],
        files
      })
    }catch(e){
      if(e.response.body?.message) return editOrReply(context, createEmbed("warning", context, e.response.body.message))
      return editOrReply(context, createEmbed("error", context, `Unable to generate text.`))
    }
  }
};