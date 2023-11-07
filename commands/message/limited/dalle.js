const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { canUseLimitedTestCommands } = require('../../../labscore/utils/testing')
const { STATICS } = require('../../../labscore/utils/statics');

const superagent = require('superagent')
const { iconPill, smallIconPill } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'dalle',
  label: 'text',
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nGenerate images with DALL-E 2.`,
    description_short: 'Generate images with DALL-E 2.',
    examples: ['dalle Otter, in the style of the great wave'],
    category: 'limited',
    usage: 'dalle <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.ATTACH_FILES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!canUseLimitedTestCommands(context)) return;
    context.triggerTyping();
    if(!args.text) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (text).`))

    let prompt = 'You are a friendly chat bot designed to help people. You should always use gender neutral pronouns when possible.'
    if(args.prompt !== "") prompt = args.prompt

    try{
      await editOrReply(context, createEmbed("ai", context, "Generating image..."))

      let res = await superagent.post(`${process.env.AI_SERVER}/openai/dalle`)
        .set({
          Authorization: process.env.AI_SERVER_KEY
        })
        .send({
          prompt: args.text,
          model: "DALLE2"
        })


      // Fetch the image
      let img = await superagent.get(res.body.output)

      let inputDisplay = args.text
      if(inputDisplay.length >= 50) inputDisplay = inputDisplay.substr(0,50) + '...'

      let description = [smallIconPill("generative_ai", inputDisplay), '']
      let files = [];
      
      if(!res.body.output) res.body.output = '[Empty Response]'
      
      const f = `lcdalle.${Date.now().toString(36)}.png`;
      files.push({
        filename: f,
        value: img.body
      })

      return editOrReply(context, {
        embeds:[createEmbed("default", context, {
          description: description.join('\n'),
          image: {
            url: "attachment://" + f
          },
          footer: {
            text: `OpenAI DALL-E • ${context.application.name}`,
            iconUrl: STATICS.openai
          }
        })],
        files
      })
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to generate text.`))
    }
  }
};