const { googleVisionOcr } = require("../../../labscore/api");
const { getRecentImage } = require("../../../labscore/utils/attachment");
const { createEmbed } = require("../../../labscore/utils/embed");
const { codeblock } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'ocr',
  metadata: {
    description: 'Uses Optical Character Recognition to detect text in images.',
    description_short: 'Image text recognition.',
    examples: ['ocr'],
    category: 'utils',
    usage: 'ocr <attachment>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.READ_MESSAGE_HISTORY, Permissions.USE_EXTERNAL_EMOJIS],
  run: async (context) => {
    context.triggerTyping();
    let image = await getRecentImage(context, 50)
    if (!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })

    let ocr;
    try{
      ocr = await googleVisionOcr(context, image)
    }catch(e){
      return editOrReply(context, { embeds: [createEmbed("error", context, "Unable to retrieve Google Vision API response.")] })
    }
    
    if(ocr.response.body.status == 1) return editOrReply(context, { embeds: [createEmbed("warning", context, ocr.response.body.text)] })

    return editOrReply(context, createEmbed("default", context, {
      thumbnail: {
        url: image
      },
      description: codeblock("ansi", [ocr.response.body.text]),
      footer: {
        iconUrl: STATICS.google,
        text: `Google Cloud Vision • ${context.application.name} • Took ${ocr.timings}s`
      }
    }))
  },
};