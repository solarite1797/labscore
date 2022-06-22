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
  run: async (context, args) => {
    try{
      await context.respond({data: { flags: MessageFlags.EPHEMERAL }, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

      const { message } = args;

      let attachment = getMessageAttachment(message)
      if(attachment && validateAttachment(attachment, "image")){
        attachment = attachment.url
      } else {
        delete attachment;
      }
      if(!attachment) return context.editOrRespond({ embeds: [createEmbed("warning", context, "No images found.")], flags: MessageFlags.EPHEMERAL })

      let ocr = await googleVisionOcr(context, attachment)

      if(ocr.response.body.text.length == 0) return context.editOrRespond({ embeds: [createEmbed("warning", context, "No text detected.")], flags: MessageFlags.EPHEMERAL })

      await context.editOrRespond({
        embeds: [createEmbed("default", context, {
          thumbnail: {
            url: attachment
          },
          description: codeblock("ansi", ["​" + ocr.response.body.text]),
          footer: {
            iconUrl: STATICS.google,
            text: `Google Cloud Vision • ${context.application.name} • Took ${ocr.timings}s`
          }
        })],
        flags: MessageFlags.EPHEMERAL
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