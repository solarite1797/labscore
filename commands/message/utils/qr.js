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
      
      await response.edit({
        embeds: [
          createEmbed("default", context, {
            image: {
              url: `attachment://qrcode.png`
            },
            footer: {
              iconUrl: `https://cdn.discordapp.com/avatars/${context.application.id}/${context.application.icon}.png?size=256`,
              text: `labsCore • Took ${((Date.now() - t) / 1000).toFixed(2)}s`
            }
          })
        ],
        files: [{
          filename: "qrcode.png",
          value: res.body
        }]
      })
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate qr code.`)]})
    }
  }
};