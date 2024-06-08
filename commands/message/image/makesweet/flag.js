const { getRecentImage } = require("#utils/attachment");
const { createEmbed } = require("#utils/embed");
const { editOrReply } = require("#utils/message");
const { STATICS } = require("#utils/statics");

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

const { flag } = require("../../../../service/makesweet");

module.exports = {
  name: 'flag',
  label: 'text',
  metadata: {
    description: 'Generates an animated gif with the MakeSweet flag template.',
    description_short: 'Animated flag generation',
    category: 'image',
    usage: 'flag <image>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {

    let image = await getRecentImage(context, 50)
    if(!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

    await editOrReply(context, createEmbed("loading", context, `Generating image...`))

    if(!args.text) args.text = ""
    try {
      const timings = Date.now();
      let mkswt = await flag(image)
      
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
      await editOrReply(context, createEmbed("error", context, e))
    }
  },
}