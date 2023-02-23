const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { getRecentImage } = require("../../../labscore/utils/attachment");

const superagent = require('superagent');

module.exports = {
  name: 'editimage',
  label: 'prompt',
  aliases: ['ei'],
  metadata: {
    description: 'Edits an image using AI.',
    description_short: 'AI image editing',
    examples: ['editimage Wearing a crown'],
    category: 'image',
    usage: 'editimage <prompt>'
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (context, args) => {
    if(!args.prompt) return editOrReply(context, { embeds: [createEmbed("warning", context, "Missing prompt.")] })

    let image = await getRecentImage(context, 50)
    if(!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })

    let response = await editOrReply(context, { embeds: [createEmbed("loading", context, `Editing image...`)] })

    let noticeTimer = setTimeout(()=>{
      let emb = createEmbed("loading", context, `Editing image...`)
      emb.footer = {
        text: "This might take several minutes to complete."
      };
      response.edit({ embeds: [ emb ] });
    }, 45000)

    try{
      let img = await superagent.get(`${process.env.AI_SERVER}/deepai/imageeditor`)
        .query({
          prompt: args.prompt,
          url: image
        })

      clearTimeout(noticeTimer)
      
      await response.edit({ embeds: [
        createEmbed("image", context, {
          url: img.body.image
        })
      ] })
    }catch(e){
      console.log(e)
      await response.edit({embeds:[createEmbed("error", context, `Image generation failed.`)]})
    }
  },
};