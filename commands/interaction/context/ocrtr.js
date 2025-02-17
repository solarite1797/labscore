const { googleVisionOcr, googleTranslate } = require('#api');
const { TRANSLATE_LANGUAGE_MAPPINGS, TRANSLATE_LANGUAGES } = require('#constants');

const { getMessageAttachment, validateAttachment } = require('#utils/attachment');
const { createEmbed } = require('#utils/embed');
const { acknowledge } = require('#utils/interactions');
const { editOrReply } = require('#utils/message');
const { codeblock, icon, pill } = require('#utils/markdown');
const { STATICS } = require('#utils/statics');

const { ApplicationCommandTypes, MessageFlags } = require("detritus-client/lib/constants");

module.exports = {
  name: 'OCR Translate',
  type: ApplicationCommandTypes.MESSAGE,
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  run: async (context, args) => {
    await acknowledge(context);
    try{

      const { message } = args;

      let attachment = getMessageAttachment(message)
      if(attachment && validateAttachment(attachment, "image")){
        attachment = attachment.url
      } else {
        delete attachment;
      }
      if(!attachment) return editOrReply(context, createEmbed("warning", context, "No images found."))

      let ocr = await googleVisionOcr(context, attachment)

      if(ocr.response.body.status == 1) return editOrReply(context, createEmbed("warning", context, ocr.response.body.text))

      try{
        let translate = await googleTranslate(context, ocr.response.body.text, "en", "auto")
        
        let fromFlag = TRANSLATE_LANGUAGE_MAPPINGS[translate.response.body.language.from || sourceLanguage] || ''
        let toFlag = TRANSLATE_LANGUAGE_MAPPINGS[translate.response.body.language.to] || ''
  
        return editOrReply(context, createEmbed("default", context, {
          description: `${icon("locale")} ​ ${fromFlag} ${pill(TRANSLATE_LANGUAGES[translate.response.body.language.from || sourceLanguage])} ​ ​ ​​${icon("arrow_right")} ​ ​ ​ ​${toFlag} ${pill(TRANSLATE_LANGUAGES[translate.response.body.language.to])}\n${codeblock("ansi", [translate.response.body.translation.substr(0,3900)])}`,
          thumbnail: {
            url: attachment
          },
          footer: {
            iconUrl: STATICS.google,
            text: `Google Cloud Vision • ${context.application.name}`
          }
        }))
      }catch(e){
        console.log(e)
        if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, createEmbed("error", context, `Unable to translate text.`))
        return editOrReply(context, createEmbed("error", context, `Something went wrong.`))
      }
    }catch(e){
      console.log(e)
      await context.editOrRespond({
        embeds: [createEmbed("error", context, "Unable to perform Optical Character Recognition.")],
        flags: MessageFlags.EPHEMERAL
      })
    }
  },
};