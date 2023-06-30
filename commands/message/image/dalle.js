const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");

const superagent = require('superagent');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'dalle',
  label: 'query',
  aliases: ['craiyon'],
  metadata: {
    description: 'Uses Craiyon to generate four images from a text prompt.',
    description_short: 'Craiyon AI image generation',
    examples: ['dalle Otter'],
    category: 'image',
    usage: 'dalle <text>'
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES],
  run: async (context, args) => {
    if(!context.channel.nsfw) return editOrReply(context, {embeds:[createEmbed("nsfw", context)]})

    let response = await editOrReply(context, { embeds: [createEmbed("loading", context, `Synthesizing images...`)] })

    let noticeTimer = setTimeout(()=>{
      let emb = createEmbed("loading", context, `Synthesizing images...`)
      emb.footer = {
        text: "This might take several minutes to complete."
      };
      editOrReply(context, { embeds: [ emb ] });
    }, 30000)

    try{
      let t = Date.now();

      let img = await superagent.post(`https://backend.craiyon.com/generate`)
        .send({
          prompt: args.query
        })

      clearTimeout(noticeTimer)
      
      let embeds = [];
      let files = [];

      for(let i = 0; i < 4; i++){
        embeds.push(createEmbed("default", context, {image: {url:`attachment://dalle${i}.jpeg`}, url: `https://example.com`, footer: { iconUrl: `https://cdn.discordapp.com/avatars/${context.application.id}/${context.application.icon}.png?size=256`, text: `${context.application.name} • Took ${((Date.now() - t) / 1000).toFixed(2)}s` }}))
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