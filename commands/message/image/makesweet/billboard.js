const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { getRecentImage } = require("../../../../labscore/utils/attachment");

const { billboardCityscape } = require("../../../../service/makesweet");
const { STATICS } = require("../../../../labscore/utils/statics");

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'billboard',
  label: 'text',
  metadata: {
    description: 'Generates an animated gif with the MakeSweet billboard template.',
    description_short: 'Animated billboard generation',
    category: 'image',
    usage: 'billboard <image>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {

    let image = await getRecentImage(context, 50)
    if(!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

    let response = await editOrReply(context, createEmbed("loading", context, `Generating image...`))

    if(!args.text) args.text = ""
    try {
      const timings = Date.now();
      let mkswt = await billboardCityscape(image)
      
      return await editOrReply(context, {
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
      await editOrReply(context, { embeds: [createEmbed("error", context, "Something went wrong.")] })
    }
  },
}