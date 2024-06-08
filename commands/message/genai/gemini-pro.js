const { LlmModelsGenerate } = require("#obelisk");

const { createEmbed } = require("#utils/embed");
const { stringwrap, iconPill, smallIconPill } = require("#utils/markdown");
const { editOrReply } = require("#utils/message");
const { STATIC_ICONS } = require("#utils/statics");
const { hasFeature } = require("#utils/testing");

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'gemini-pro',
  label: 'text',
  aliases: ['gpro'],
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n${smallIconPill("reply", "Supports Replies")}\n\nRun Gemini 1.0 Pro with a custom prompt.`,
    description_short: 'Gemini-1.0-Pro',
    examples: ['gem why do they call it oven when you of in the cold food of out hot eat the food'],
    category: 'limited',
    usage: 'gemini-pro <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!await hasFeature(context, "ai/gemini/text")) return;
    context.triggerTyping();

    if(!args.text) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (text).`))

    let input = args.text;

    try{
      await editOrReply(context, createEmbed("ai_custom", context, STATIC_ICONS.ai_gemini))

      let res = await LlmModelsGenerate(context, "gemini-1.5-pro", input, "BLOCK_NONE")

      let description = []
      let files = [];
      
      if(res.response.body.message) return editOrReply(context, createEmbed("error", context, e.response.body.message))

      let output = res.response.body.candidates[0]?.output
      if(!output) return editOrReply(context, createEmbed("error", context, `Gemini returned an error. Try again later.`)) 

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