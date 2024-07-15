const { googleVisionOcr, googleTranslate } = require("#api");
const { TRANSLATE_LANGUAGES, TRANSLATE_LANGUAGE_MAPPINGS } = require("#constants");

const { getRecentImage } = require("#utils/attachment");
const { createEmbed } = require("#utils/embed");
const { codeblock, icon, pill, limitedString, smallIconPill } = require("#utils/markdown");
const { editOrReply } = require("#utils/message");
const { STATICS } = require("#utils/statics");
const { isSupported, getCodeFromAny } = require('#utils/translate');

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'ocrtr',
  label: 'to',
  aliases: ["octr"],
  metadata: {
    description: `${smallIconPill("reply", "Supports Replies")}\n\nUses Optical Character Recognition to translate text in an image.`,
    description_short: 'Image text recognition + translation.',
    examples: ['ocrtr en -from pl'],
    category: 'utils',
    usage: 'ocrtr <language> [-from <origin language>]',
    slashCommand: "OCR Translate"
  },
  args: [
    {name: 'from', default: 'auto', type: 'string', help: "Language to translate from"}
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.READ_MESSAGE_HISTORY, Permissions.USE_EXTERNAL_EMOJIS],
  run: async (context, args) => {
    context.triggerTyping();

    if(!args.to) args.to = "en"
    if(args.to.startsWith("-to")) args.to = args.to.replace("-to ", "")

    if(!isSupported(args.to)) return editOrReply(context, createEmbed("warning", context, `Invalid source language (${limitedString(args.from, 10)}).`))
    if(!isSupported(args.from)) return editOrReply(context, createEmbed("warning", context, `Invalid source language (${limitedString(args.from, 10)}).`))

    let targetLanguage = getCodeFromAny(args.to)
    let sourceLanguage = getCodeFromAny(args.from)

    let image = await getRecentImage(context, 50)
    if (!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

    let ocr;
    try{
      ocr = await googleVisionOcr(context, image)
    }catch(e){
      return editOrReply(context, createEmbed("error", context, "Unable to retrieve Google Vision API response."))
    }
    
    if(ocr.response.body.status == 1) return editOrReply(context, createEmbed("warning", context, ocr.response.body.text))

    try{
      let translate = await googleTranslate(context, ocr.response.body.text, targetLanguage, sourceLanguage)
      
      let fromFlag = TRANSLATE_LANGUAGE_MAPPINGS[translate.response.body.language.from || sourceLanguage] || ''
      let toFlag = TRANSLATE_LANGUAGE_MAPPINGS[translate.response.body.language.to] || ''

      return editOrReply(context, createEmbed("default", context, {
        description: `${icon("locale")} ​ ${fromFlag} ${pill(TRANSLATE_LANGUAGES[translate.response.body.language.from || sourceLanguage])} ​ ​ ​​${icon("arrow_right")} ​ ​ ​ ​${toFlag} ${pill(TRANSLATE_LANGUAGES[translate.response.body.language.to])}\n${codeblock("ansi", [translate.response.body.translation.substr(0,4000)])}`,
        thumbnail: {
          url: image
        },
        footer: {
          iconUrl: STATICS.google,
          text: `Google Cloud Vision • ${context.application.name}`
        }
      }))
    }catch(e){
      if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, createEmbed("error", context, `Unable to translate text.`))
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Something went wrong.`))
    }
  }
};