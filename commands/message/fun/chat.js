const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { canUseLimitedTestCommands, isLimitedTestUser } = require('../../../labscore/utils/testing')
const { STATICS } = require('../../../labscore/utils/statics');

const superagent = require('superagent')
const { iconPill, smallIconPill, icon } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'chat',
  label: 'text',
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nTalk to ChatGPT.\n\n<:bonzi:1138585089891106836> He will explore the Internet with you as your very own friend and sidekick! He can talk, walk, and joke like no other friend you've ever had!`,
    description_short: 'Talk to ChatGPT.',
    examples: ['chat How many otter species are there?'],
    category: 'limited',
    usage: 'chat <input> [-prompt <prompt override>]'
  },
  args: [
    { name: 'prompt', default: '', required: false, help: "The starting system prompt." },
    { name: 'temperature', default: 0.5, required: false, help: "Model temperature." },
    { name: 'model', default: 'CHATGPT', required: false, help: "The model to use. (Restricted to CHATGPT)" },
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.ATTACH_FILES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!canUseLimitedTestCommands(context)) return;
    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})

    let input = args.text;
    
    let prompt = 'You are a friendly chat bot designed to help people. You should always use gender neutral pronouns when possible.'
    if(args.prompt !== "") prompt = args.prompt

    if(context.message.messageReference) {
      let msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId);
      if(msg.content && msg.content.length) input = msg.content
      else if(msg.embeds?.length) for(const e of msg.embeds) if(e[1].description?.length) { input = e[1].description; break; } 

      prompt = args.text
      if(args.prompt !== "") return editOrReply(context, {embeds:[createEmbed("warning", context, `Prompt parameter is unsupported for message replies.`)]})
    }

    let model = "CHATGPT"
    let modelDisplay = ""
    if(args.model && isLimitedTestUser(context.user)){
      model = args.model
      modelDisplay = "  " + smallIconPill("robot", model) 
    }
    
    let temperature = "CHATGPT"
    let temperatureDisplay = ""
    if(args.temperature){
      temperature = parseFloat(args.temperature)
      temperatureDisplay = "  " + smallIconPill("example", temperature) 
    }

    
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

      let inputDisplay = args.text
      if(inputDisplay.length >= 50) inputDisplay = inputDisplay.substr(0,50) + '...'

      let description = [smallIconPill("generative_ai", inputDisplay) + modelDisplay + temperatureDisplay, '']
      let files = [];
      
      if(!res.body.output) res.body.output = '[Empty Response]'
      
      if(res.body.output.length <= 2000) description.push(res.body.output.substr(0, 2000 - args.text.length))
      else {
        files.push({
          filename: `chat.${Date.now().toString(36)}.txt`,
          value: Buffer.from(res.body.output)
        })
      }

      return editOrReply(context, {
        embeds:[createEmbed("default", context, {
          description: description.join('\n').substr(),
          footer: {
            text: `This information may be inaccurate or biased • ${context.application.name}`,
            iconUrl: STATICS.openai
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