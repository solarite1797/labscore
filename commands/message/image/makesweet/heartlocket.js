const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { getRecentImage } = require("../../../../labscore/utils/attachment");

const { heartLocket } = require("../../../../service/makesweet");
const { STATICS } = require("../../../../labscore/utils/statics");

module.exports = {
  name: 'heartlocket',
  label: 'text',
  metadata: {
    description: 'makesweet heart locket',
    examples: ['heartlocket'],
    category: 'image',
    usage: 'heartlocket'
  },
  run: async (context, args) => {

    let image = await getRecentImage(context, 50)
    if(!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

    let response = await editOrReply(context, createEmbed("loading", context, `Generating image...`))

    if(!args.text) args.text = ""
    try {
      const timings = Date.now();
      let mkswt = await heartLocket(args.text, image)
      
      await response.edit({ embeds: [createEmbed("default", context, {
        image: {
          url: "attachment://makesweet.gif"
        },
        footer: {
          iconUrl: STATICS.makesweet,
          text: `MakeSweet • Took ${((Date.now() - timings) / 1000).toFixed(2)}s`
        }
      })], files: [{
        filename: "makesweet.gif",
        value: mkswt.body
      }] })
    } catch (e) {
      await response.edit({ embeds: [createEmbed("error", context, e)] })
    }
  }
}