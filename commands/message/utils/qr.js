const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const superagent = require('superagent');

module.exports = {
  name: 'qr',
  label: 'text',
  metadata: {
    description: 'qr code generator',
    examples: ['qr big nutty'],
    category: 'utils',
    usage: `qr <contents>`
  },
  run: async (context, args) => {
    context.triggerTyping();
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
};