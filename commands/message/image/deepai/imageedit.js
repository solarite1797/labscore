const { getRecentImage } = require("../../../../labscore/utils/attachment");
const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { deepdream, imageedit } = require('../../../../labscore/api')

module.exports = {
  name: 'editimage',
  aliases: ['ei'],
  label: 'prompt',
  metadata: {
    description: 'Edits an image using AI.',
    description_short: 'AI image editing',
    examples: ['editimage With a crown'],
    category: 'image',
    usage: 'editimage <prompt>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    try{
      if(!args.prompt) return editOrReply(context, { embeds: [createEmbed("warning", context, "Missing prompt.")] })

      let image = await getRecentImage(context, 50)
      if(!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })

      let res = await imageedit(context, image, args.prompt)

      if(res.response.body.status == 1) return editOrReply(context, {embeds:[createEmbed("warning", context, res.response.body.errors[0])]})

      return editOrReply(context, createEmbed("image", context, {
        url: res.response.body.image,
        time: res.timings
      }))
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Image editing timed out.`)]})
    }
  },
};