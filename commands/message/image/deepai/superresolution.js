const { getRecentImage } = require("../../../../labscore/utils/attachment");
const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { superresolution } = require('../../../../labscore/api')

module.exports = {
  name: 'superresolution',
  aliases: ['sr'],
  metadata: {
    description: 'Upscales an image with SuperResolution.',
    examples: ['superresolution'],
    category: 'image',
    usage: 'superresolution <image>'
  },
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
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to modify image.`)]})
    }
  },
};