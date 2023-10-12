const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { canUseLimitedTestCommands, isLimitedTestUser } = require('../../../labscore/utils/testing')
const { STATICS } = require('../../../labscore/utils/statics');

const superagent = require('superagent')
const { iconPill } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");

const MODELS = {
  "CHATGPT": {
    icon: STATICS.chatgpt,
    name: "ChatGPT"
  },
  "GPT4": {
    icon: STATICS.openai,
    name: "GPT-4"
  }
}

module.exports = {
  name: 'chat',
  label: 'text',
  aliases: ['openai','gpt','chatgpt'],
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nTalk to ChatGPT.`,
    description_short: 'Talk to ChatGPT.',
    examples: ['chat How many otter species are there?'],
    category: 'limited',
    usage: 'chat <input> [-prompt <prompt override>]'
  },
  args: [
    { name: 'prompt', default: '', required: false, help: "The starting system prompt." },
    { name: 'temperature', default: 0.5, required: false, help: "Model temperature." },
    { name: 'model', default: 'CHATGPT', required: false, help: "The model to use. (Model cannot be changed for regular users)" },
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.ATTACH_FILES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!canUseLimitedTestCommands(context)) return;

    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})

    let input = args.text;
    
    let prompt = `You are a friendly chat bot designed to help people.\n- Today\'s date is ${new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"long", day:"numeric"})}\n- You should always use gender neutral pronouns when possible.`
    if(args.prompt !== "") prompt = args.prompt

    // Get content if the user replies to anything
    if(context.message.messageReference) {
      let msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId);

      if(msg.content && msg.content.length) input = msg.content
      else if(msg.embeds?.length) for(const e of msg.embeds) if(e[1].description?.length) { input = e[1].description; break; } 

      prompt = args.text
      if(args.prompt !== "") return editOrReply(context, {embeds:[createEmbed("warning", context, `Prompt parameter is unsupported for message replies.`)]})
    }

    let model = "CHATGPT"
    if(args.model && isLimitedTestUser(context.user)) model = args.model
    
    if(!MODELS[model]) return editOrReply(context, {embeds:[createEmbed("warning", context, `Invalid or unsupported model (${model}).`)]})

    let temperature = "0.25"
    if(args.temperature !== 0.25) temperature = parseFloat(args.temperature)

    
    try{
      await editOrReply(context, createEmbed("ai", context, "Generating response..."))

      let res = await superagent.post(`${process.env.AI_SERVER}/openai`)
        .set({
          Authorization: process.env.AI_SERVER_KEY
        })
        .send({
          prompt,
          input: [input],
          temperature,
          model
        })

      let inputDisplay = args.text.replace(/\n/g, ' ')
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
            iconUrl: MODELS[model].icon,
            name: inputDisplay
          },
          description: description.join('\n'),
          footer: {
            text: `${MODELS[model].name} • This information may be inaccurate or biased`
          }
        })],
        files
      })
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate text.`)]})
    }
  }
};