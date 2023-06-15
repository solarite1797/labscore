const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { getRecentImage } = require("../../../labscore/utils/attachment");
const { codeblock, icon } = require('../../../labscore/utils/markdown');

const superagent = require('superagent');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'qr',
  label: 'text',
  aliases: ['scan'],
  metadata: {
    description: 'Generates a QR code. If no input is provided acts as a QR code scanner.',
    description_short: 'QR Code scanner/generator.',
    examples: ['qr big nutty'],
    category: 'utils',
    usage: `qr <contents>`
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.READ_MESSAGE_HISTORY, Permissions.ATTACH_FILES, Permissions.USE_EXTERNAL_EMOJIS],
  run: async (context, args) => {

    // If we have an argument, generate code 
    if(args.text.length){
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
      await context.triggerTyping();

      const t = Date.now();
  
      let res = await superagent.get(`https://api.qrserver.com/v1/read-qr-code/`)
        .query({
          "fileurl": image
        })
  
      if (!res.body[0].symbol[0].data) return editOrReply(context, createEmbed("warning", context, "No QR codes found."))
  
      let resultData = res.body[0].symbol[0].data.split('\nQR-Code:');
      let results = [];
      for(const r of resultData){
        results.push(codeblock("ansi", [r]))
      }
      
      let s = "";
      if(resultData.length >= 2) s = "s"

      return await editOrReply(context, createEmbed("default", context, {
        description: `${icon("qr")} Found **${resultData.length}** QR Code${s}:${results.join(' ')}`,
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