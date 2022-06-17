const { getRecentImage } = require("../../../labscore/utils/attachment");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");

const superagent = require('superagent');

module.exports = {
  name: 'dalle',
  label: 'query',
  metadata: {
    description: 'dalle',
    examples: ['dalle'],
    category: 'image',
    usage: 'dalle <text>'
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 15000
  },
  run: async (context, args) => {
    context.triggerTyping();
    let response = await editOrReply(context, { embeds: [createEmbed("loading", context, `Synthesizing images...`)] })

    // Display a message if server might be busy.
    let notice = setTimeout(() => {
      response.edit({ embeds: [createEmbed("loading", context, "DALL-E Server might be under heavy load, generation takes a bit...")] })
    }, 15000)

    try{
      let t = Date.now();

      let img = await superagent.post(`https://bf.dallemini.ai/generate`)
        .send({
          prompt: args.query
        })
      
      clearTimeout(notice)

      let embeds = [];
      let files = [];

      for(let i = 0; i < 4; i++){
        embeds.push(createEmbed("default", context, {image: {url:`attachment://dalle${i}.jpeg`}, url: `https://example.com`, footer: { iconUrl: `https://cdn.discordapp.com/avatars/${context.application.id}/${context.application.icon}.png?size=256`, text: `${context.application.name} • Took ${((Date.now() - t) / 1000).toFixed(2)}s` }}))
        files.push({
          filename: `dalle${i}.jpeg`,
          value: Buffer.from(img.body.images[i], 'base64')
        })
      }
      
      await response.edit({ embeds, files })
    }catch(e){
      console.log(e)
      clearTimeout(notice)
      if(e.response.status == 503) return await response.edit({embeds:[createEmbed("error", context, `DALL-E server is busy, try again later.`)]})
      await response.edit({embeds:[createEmbed("error", context, `Image generation failed.`)]})
    }
  },
};