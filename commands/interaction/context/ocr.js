const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandTypes, MessageFlags } = Constants;

const { googleVisionOcr } = require('../../../labscore/api');
const { getMessageAttachment, validateAttachment } = require('../../../labscore/utils/attachment');

const { createEmbed } = require('../../../labscore/utils/embed');
const { codeblock } = require('../../../labscore/utils/markdown');
const { STATICS } = require('../../../labscore/utils/statics');

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
      await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

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