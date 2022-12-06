const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { getRecentImage } = require("../../../../labscore/utils/attachment");

const { heartLocket } = require("../../../../service/makesweet");
const { STATICS } = require("../../../../labscore/utils/statics");

module.exports = {
  name: 'heartlocket',
  label: 'text',
  metadata: {
    description: 'Generates an animated gif with the MakeSweet heart locket template. Accepts text as an optional input.',
    examples: ['heartlocket Big Nutty'],
    category: 'image',
    usage: 'heartlocket [<text>]'
  },
  run: async (context, args) => {

    let image = await getRecentImage(context, 50)
    if(!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

    let response = await editOrReply(context, createEmbed("loading", context, `Generating image...`))

    if(!args.text) args.text = ""
    try {
      const timings = Date.now();
      let mkswt = await heartLocket(args.text, image)
      
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