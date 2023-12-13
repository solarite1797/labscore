const { geminiVision } = require("../../../labscore/api/obelisk");
const { getRecentImage } = require("../../../labscore/utils/attachment");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { getUser } = require("../../../labscore/utils/users");

const { Permissions } = require("detritus-client/lib/constants");

const superagent = require('superagent');
const { STATIC_ICONS } = require("../../../labscore/utils/statics");
const { stringwrap } = require("../../../labscore/utils/markdown");
const { canUseLimitedTestCommands } = require("../../../labscore/utils/testing");
module.exports = {
  name: 'gemini-vision',
  label: 'text',
  aliases: ['gv'],
  metadata: {
    description: 'Gemini Vision.',
    description_short: 'Pride overlay',
    examples: ['gv Which show is this image from?'],
    category: 'limited',
    usage: 'gemini-vision <attachment> <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!canUseLimitedTestCommands(context)) return;
    context.triggerTyping();

    let image = await getRecentImage(context, 50)
    if (!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

    if(!args.text) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (text).`))

    let input = args.text;

    try{
      await editOrReply(context, createEmbed("ai_custom", context, STATIC_ICONS.ai_gemini))

      let res = await geminiVision(context, input, image)

      let description = []
      let files = [];
      
      if(res.response.body.message) return editOrReply(context, createEmbed("error", context, e.response.body.message))

      let output = res.response.body.gemini?.candidates[0]?.content?.parts[0]?.text
      if(!output) return editOrReply(context, createEmbed("error", context, `PaLM 2 returned an error. Try again later.`)) 


      if(output.length <= 4000) description.push(output)
      else {
        files.push({
          filename: `gemini.${Date.now().toString(36)}.txt`,
          value: Buffer.from(output)
        })
      }

      return editOrReply(context, {
        embeds:[createEmbed("defaultNoFooter", context, {
          author: {
            name: stringwrap(input, 50, false),
            iconUrl: STATIC_ICONS.ai_gemini
          },
          thumbnail: {
            url: image
          },
          description: description.join('\n'),
          footer: {
            text: `Generative AI is experimental • Data submitted to Gemini may be used by Google for training.`
          }
        })],
        files
      })
    } catch(e){
      console.log(e)
      if(e.response?.body?.message) return editOrReply(context, createEmbed("error", context, e.response.body.message))
      return editOrReply(context, createEmbed("error", context, `Unable to generate response.`))
    }
  }
};