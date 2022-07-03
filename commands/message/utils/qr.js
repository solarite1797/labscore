const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { getRecentImage } = require("../../../labscore/utils/attachment");
const { codeblock } = require('../../../labscore/utils/markdown');

const superagent = require('superagent');

module.exports = {
  name: 'qr',
  label: 'text',
  aliases: ['scan'],
  metadata: {
    description: 'qr code generator/scanner\n\nif no arguments are provided it\'ll try to scan the most recent qr code',
    examples: ['qr big nutty'],
    category: 'utils',
    usage: `qr <contents>`
  },
  run: async (context, args) => {

    // If we have an argument, generate code 
    if(args.text.length){
      await context.triggerTyping();

      let response = await editOrReply(context, createEmbed("loading", context, `Generating qr code...`))
      try{
        const t = Date.now();

        let res = await superagent.get(`https://api.qrserver.com/v1/create-qr-code/`)
          .query({
            "size": "1024x1024",
            "data": args.text
          })
        
        return await response.edit({
          embeds: [createEmbed("image", context, {
            url: "qrcode.png",
            time: ((Date.now() - t) / 1000).toFixed(2)
          })],
          files: [{ filename: "qrcode.png", value: res.body }]
        })
      }catch(e){
        return await response.edit({ embeds: [createEmbed("error", context, `Unable to generate qr code.`) ] })
      }
    }

    let image = await getRecentImage(context, 50)
    if (!image) return editOrReply(context, createEmbed("warning", context, "No images found."))
  
    try {
      const t = Date.now();
  
      let res = await superagent.get(`https://api.qrserver.com/v1/read-qr-code/`)
        .query({
          "fileurl": image
        })
  
      if (!res.body[0].symbol[0].data) return editOrReply(context, createEmbed("warning", context, "No QR codes found."))
  
      return await editOrReply(context, createEmbed("default", context, {
        description: codeblock("ansi", [res.body[0].symbol[0].data]),
        thumbnail: {
          url: image
        },
        footer: {
          iconUrl: `https://cdn.discordapp.com/avatars/${context.application.id}/${context.application.icon}.png?size=256`,
          text: `labsCore • Took ${((Date.now() - t) / 1000).toFixed(2)}s`
        }
      }))
      
    }catch(e){
      console.log(e)
      return editOrReply(context, { embeds: [createEmbed("error", context, `Unable to scan qr codes.`)] })
    }
  }
};