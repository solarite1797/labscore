const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { getRecentImage } = require("../../../../labscore/utils/attachment");

const { billboardCityscape } = require("../../../../service/makesweet");
const { STATICS } = require("../../../../labscore/utils/statics");

module.exports = {
  name: 'billboard',
  label: 'text',
  metadata: {
    description: 'Generates an animated gif with the MakeSweet billboard template.',
    examples: ['billboard'],
    category: 'image',
    usage: 'billboard'
  },
  run: async (context, args) => {

    let image = await getRecentImage(context, 50)
    if(!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

    let response = await editOrReply(context, createEmbed("loading", context, `Generating image...`))

    if(!args.text) args.text = ""
    try {
      const timings = Date.now();
      let mkswt = await billboardCityscape(image)
      
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
      console.log(e)
      await response.edit({ embeds: [createEmbed("error", context, "Something went wrong.")] })
    }
  },
}