const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");

const superagent = require('superagent');
const { getRecentImage } = require("../../../labscore/utils/attachment");

module.exports = {
  name: 'anime',
  label: 'query',
  metadata: {
    description: 'Uses Stable Diffusion to generate an image using anime styling from a text prompt.\n\n**Replying** to a message with an image will use said image as a base for the AI (img2img), this does __not__ support inpainting/adding elements to the image.',
    description_short: 'AI Anime image generation',
    explicit: true,
    examples: ['anime otter'],
    category: 'image',
    usage: 'anime <text>'
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (context, args) => {
    if(!context.channel.nsfw) return editOrReply(context, {embeds:[createEmbed("nsfw", context)]})
    if(args.query.length == 0) return editOrReply(context, {embeds:[createEmbed("warning", context, "Missing prompt")]})

    let hasUrl = false;
    let image;
    if(context.message.messageReference){
      image = await getRecentImage(context, 50)
      hasUrl = true;
      if(!image) return editOrReply(context, createEmbed("warning", context, "No images found."))
    }

    let response = await editOrReply(context, { embeds: [createEmbed("loading", context, `Generating image...`)] })

    let noticeTimer = setTimeout(()=>{
      let emb = createEmbed("loading", context, `Generating image...`)
      emb.footer = {
        text: "This might take a moment to complete."
      };
      response.edit({ embeds: [ emb ] });
    }, 45000)

    try{
      let t = Date.now();

      let img;
      if(hasUrl){
        img = await superagent.get(`${process.env.AI_SERVER}/anime/img2img`)
          .query({
            prompt: args.query,
            url: image
          })
      } else {
        img = await superagent.get(`${process.env.AI_SERVER}/anime`)
          .query({
            prompt: args.query
          })
      }
      clearTimeout(noticeTimer)
      
      if(img.body.message) return await response.edit({embeds:[createEmbed("warning", context, img.body.message)]})

      let embeds = [];
      let files = [];
      
      embeds.push(createEmbed("default", context, {image: {url:`attachment://anime.png`}, url: `https://example.com`, footer: { iconUrl: `https://cdn.discordapp.com/avatars/${context.application.id}/${context.application.icon}.png?size=256`, text: `${context.application.name} • Took ${((Date.now() - t) / 1000).toFixed(2)}s` }}))
      files.push({
        filename: `anime.png`,
        value: Buffer.from(img.body.image, 'base64')
      })
      
      await response.edit({ embeds, files })
    }catch(e){
      clearTimeout(noticeTimer)
      console.log(e)
      await response.edit({embeds:[createEmbed("error", context, `Image generation failed.`)]})
    }
  },
};