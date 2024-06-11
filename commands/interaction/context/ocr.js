const { googleVisionOcr } = require('#api');

const { getMessageAttachment, validateAttachment } = require('#utils/attachment');
const { createEmbed } = require('#utils/embed');
const { acknowledge } = require('#utils/interactions');
const { codeblock } = require('#utils/markdown');
const { STATICS } = require('#utils/statics');

const { ApplicationCommandTypes, MessageFlags } = require("detritus-client/lib/constants");

module.exports = {
  name: 'OCR',
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
    try{
      await acknowledge(context);

      const { message } = args;

      let attachment = getMessageAttachment(message)
      if(attachment && validateAttachment(attachment, "image")){
        attachment = attachment.url
      } else {
        delete attachment;
      }
      if(!attachment) return context.editOrRespond({ embeds: [createEmbed("warning", context, "No images found.")] })

      let ocr = await googleVisionOcr(context, attachment)

      if(ocr.response.body.status == 1) return context.editOrRespond({ embeds: [createEmbed("warning", context, ocr.response.body.text)] })

      await context.editOrRespond({
        embeds: [createEmbed("default", context, {
          thumbnail: {
            url: attachment
          },
          description: codeblock("ansi", ["​" + ocr.response.body.text.substr(0,3900)]),
          footer: {
            iconUrl: STATICS.google,
            text: `Google Cloud Vision • ${context.application.name} • Took ${ocr.timings}s`
          }
        })]
      })
    }catch(e){
      console.log(e)
      await context.editOrRespond({
        embeds: [createEmbed("error", context, "Unable to perform Optical Character Recognition.")],
        flags: MessageFlags.EPHEMERAL
      })
    }
  },
};