const { getRecentImage } = require("../../../../labscore/utils/attachment");
const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { text2image } = require('../../../../labscore/api');

module.exports = {
  name: 'text2image',
  label: 'text',
  aliases: ['t2i'],
  metadata: {
    description: 'Generates an image with DeepAI Text2Image using a text prompt.',
    examples: ['text2image Mushroom'],
    category: 'image',
    usage: 'text2image <image>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    try{
      if(!args.text) return editOrReply(context, { embeds: [createEmbed("warning", context, "Missing parameter (text).")] })

      let res = await text2image(context, args.text)

      if(res.response.body.status == 1) return editOrReply(context, {embeds:[createEmbed("warning", context, res.response.body.errors[0])]})    
      
      return editOrReply(context, createEmbed("image", context, {
        url: res.response.body.image,
        time: res.timings
      }))
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate image.`)]})
    }
  },
};