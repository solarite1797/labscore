const { getRecentImage } = require("../../../../labscore/utils/attachment");
const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { superresolution } = require('../../../../labscore/api')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'superresolution',
  aliases: ['sr'],
  metadata: {
    description: 'Upscales an image with SuperResolution.',
    description_short: 'SuperResolution upscaling',
    category: 'image',
    usage: 'superresolution <image>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    context.triggerTyping();
    try{
      let image = await getRecentImage(context, 50)
      if(!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })

      let res = await superresolution(context, image)

      if(res.response.body.status == 1) return editOrReply(context, {embeds:[createEmbed("warning", context, res.response.body.errors[0])]})
      
      return editOrReply(context, createEmbed("image", context, {
        url: res.response.body.image,
        time: res.timings
      }))
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Superresolution timed out.`)]})
    }
  },
};