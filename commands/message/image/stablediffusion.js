const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");

const superagent = require('superagent');

const { Permissions } = require("detritus-client/lib/constants");
const { STATICS } = require("../../../labscore/utils/statics");

module.exports = {
  name: 'stability',
  label: 'query',
  aliases: ['genimg'],
  metadata: {
    description: 'Uses Stable Diffusion to generate four images from a text prompt.',
    description_short: 'Stable Diffusion image generation',
    examples: ['genimg Otter, digital art'],
    category: 'broken',
    usage: 'stability <text>'
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES],
  run: async (context, args) => {
    return;
    let response = await editOrReply(context, { embeds: [createEmbed("loading", context, `Synthesizing images...`)] })

    let noticeTimer = setTimeout(()=>{
      let emb = createEmbed("loading", context, `Synthesizing images...`)
      emb.footer = {
        text: "This might take several minutes to complete."
      };
      response.edit({ embeds: [ emb ] });
    }, 45000)

    try{
      let t = Date.now();

      let img = await superagent.get(`${process.env.AI_SERVER}/generate`)
        .query({
          prompt: args.query
        })

      clearTimeout(noticeTimer)
      
      if(img.body.message) return await response.edit({embeds:[createEmbed("warning", context, img.body.message)]})

      let embeds = [];
      let files = [];
      
      for(let i = 0; i < 4; i++){
        embeds.push(createEmbed("default", context, {image: {url:`attachment://stability${i}.jpeg`}, url: `https://example.com`, footer: { iconUrl: STATICS.labscore, text: `${context.application.name} • Took ${((Date.now() - t) / 1000).toFixed(2)}s` }}))
        files.push({
          filename: `stability${i}.jpeg`,
          value: Buffer.from(img.body.images[i].replace('data:image/jpeg;base64,',''), 'base64')
        })
      }
      
      await response.edit({ embeds, files })
    }catch(e){
      await response.edit({embeds:[createEmbed("error", context, `Image generation failed.`)]})
    }
  },
};