const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { getRecentImage } = require("../../../../labscore/utils/attachment");

const { circuitBoard } = require("../../../../service/makesweet");
const { STATICS } = require("../../../../labscore/utils/statics");

module.exports = {
  name: 'circuitboard',
  label: 'text',
  metadata: {
    description: 'makesweet circuit board',
    examples: ['circuitboard'],
    category: 'image',
    usage: 'circuitboard'
  },
  run: async (context, args) => {

    let image = await getRecentImage(context, 50)
    if(!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

    let response = await editOrReply(context, createEmbed("loading", context, `Generating image...`))

    if(!args.text) args.text = ""
    try {
      const timings = Date.now();
      let mkswt = await circuitBoard(image)
      
      return await response.edit({
        embeds: [createEmbed("image", context, {
          url: "makesweet.gif",
          time: ((Date.now() - timings) / 1000).toFixed(2),
          provider: {
            icon: STATICS.makesweet,
            text: "MakeSweet"
          }
        })],
        files: [{ filename: "makesweet.gif", value: mkswt.body }]
      })
    } catch (e) {
      await response.edit({ embeds: [createEmbed("error", context, e)] })
    }
  }
}