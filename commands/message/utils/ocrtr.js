const { googleVisionOcr, googleTranslate } = require("../../../labscore/api");
const { getRecentImage } = require("../../../labscore/utils/attachment");
const { createEmbed } = require("../../../labscore/utils/embed");
const { codeblock, icon, highlight } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");
const { isSupported } = require("../../../labscore/utils/translate");

module.exports = {
  name: 'ocrtr',
  label: 'to',
  aliases: ["octr"],
  metadata: {
    description: 'Uses Optical Character Recognition to translate text in an image.',
    description_short: 'Image Text Translation',
    examples: ['ocrtr en'],
    category: 'utils',
    usage: 'ocrtr <language> [-from <origin language>]'
  },
  args: [
    {name: 'from', default: 'auto', type: 'string', help: "Language to translate from"}
  ],
  run: async (context, args) => {
    context.triggerTyping();

    if(!args.to) args.to = "en"

    if(!isSupported(args.to)) return editOrReply(context, createEmbed("warning", context, "Invalid language (to)."))
    if(!isSupported(args.from)) return editOrReply(context, createEmbed("warning", context, "Invalid language (from)."))

    let image = await getRecentImage(context, 50)
    if (!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })

    let ocr;
    try{
      ocr = await googleVisionOcr(context, image)
    }catch(e){
      return editOrReply(context, { embeds: [createEmbed("error", context, "Unable to retrieve Google Vision API response.")] })
    }
    
    if(ocr.response.body.status == 1) return editOrReply(context, { embeds: [createEmbed("warning", context, ocr.response.body.message)] })

    try{
      let translate = await googleTranslate(context, ocr.response.body.text, args.to, args.from)
      return editOrReply(context, createEmbed("default", context, {
        description: `${icon("locale")} ${highlight(`${translate.response.body.language.from} -> ${translate.response.body.language.to}`)}\n${codeblock("ansi", [translate.response.body.translation])}`,
        thumbnail: {
          url: image
        },
        footer: {
          iconUrl: STATICS.google,
          text: `Google Cloud Vision • ${context.application.name} • Took ${parseFloat(ocr.timings) + parseFloat(translate.timings)}s`
        }
      }))
    }catch(e){
      console.log(e)
      if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to translate text.`)]})
      return editOrReply(context, {embeds:[createEmbed("error", context, `Something went wrong.`)]})
    }
  }
};