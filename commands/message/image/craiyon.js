const { createEmbed } = require("#utils/embed");
const { editOrReply } = require("#utils/message");
const { STATICS } = require("#utils/statics");

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

const superagent = require('superagent');

module.exports = {
  name: 'craiyon',
  label: 'query',
  metadata: {
    description: 'Uses Craiyon to generate four images from a text prompt.',
    description_short: 'Craiyon AI image generation',
    examples: ['craiyon Otter'],
    category: 'image',
    usage: 'craiyon <text>'
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    await editOrReply(context, createEmbed("loading", context, `Synthesizing images...`))

    let noticeTimer = setTimeout(()=>{
      let emb = createEmbed("loading", context, `Synthesizing images...`)
      emb.footer = {
        text: "This might take several minutes to complete."
      };
      editOrReply(context, { embeds: [ emb ] });
    }, 30000)

    try{
      let t = Date.now();

      let img = await superagent.post(`https://bf.dallemini.ai/generate`)
        .send({
          prompt: args.query
        })

      clearTimeout(noticeTimer)
      
      let embeds = [];
      let files = [];

      for(let i = 0; i < 4; i++){
        embeds.push(createEmbed("default", context, {image: {url:`attachment://dalle${i}.jpeg`}, url: `https://example.com`, footer: { iconUrl: STATICS.labscore, text: `${context.application.name} • Took ${((Date.now() - t) / 1000).toFixed(2)}s` }}))
        files.push({
          filename: `dalle${i}.jpeg`,
          value: Buffer.from(img.body.images[i], 'base64')
        })
      }
      
      await editOrReply(context, { embeds, files })
    }catch(e){
      if(e.response.status == 503) return await editOrReply(context, createEmbed("error", context, `DALL-E Mini server is busy, try again later.`))
      await editOrReply(context, createEmbed("error", context, `Image generation failed.`))
    }
  },
};
