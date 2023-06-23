const { getRecentImage } = require("../../../../labscore/utils/attachment");
const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { waifu2x } = require('../../../../labscore/api')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'waifu2x',
  aliases: ['w2x'],
  metadata: {
    description: 'Processes an image with Waifu2x.',
    description_short: 'Waifu2x upscaling',
    examples: ['waifu2x'],
    category: 'broken',
    usage: 'waifu2x <image>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES],
  run: async (context) => {
    return;
    context.triggerTyping();
    try{
      let image = await getRecentImage(context, 50)
      if(!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })

      let res = await waifu2x(context, image)

      if(res.response.body.status == 1) return editOrReply(context, {embeds:[createEmbed("warning", context, res.response.body.errors[0])]})    
      
      return editOrReply(context, createEmbed("image", context, {
        url: res.response.body.image,
        time: res.timings
      }))
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Waifu2x timed out.`)]})
    }
  },
};