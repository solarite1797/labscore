const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')
const { codeblock } = require('../../../labscore/utils/markdown');

const { getRecentImage } = require("../../../labscore/utils/attachment");

const superagent = require('superagent');

module.exports = {
  name: 'scan',
  metadata: {
    description: 'qr code scanner',
    examples: ['scan'],
    category: 'utils',
    usage: `scan <image>`
  },
  run: async (context) => {
    context.triggerTyping();

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
    } catch (e) {
      console.log(e)
      return editOrReply(context, { embeds: [createEmbed("error", context, `Unable to scan qr codes.`)] })
    }
  }
};