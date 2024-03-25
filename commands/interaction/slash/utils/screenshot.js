const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { webshot } = require("../../../../labscore/api/obelisk");

const { ApplicationCommandOptionTypes, InteractionCallbackTypes } = require('detritus-client/lib/constants');

module.exports = {
  name: 'screenshot',
  description: 'Create a screenshot of a website.',
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  options: [
    {
      name: 'url',
      description: 'Website URL.',
      type: ApplicationCommandOptionTypes.TEXT,
      required: true
    }
  ],
  run: async (context, args) => {
    await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

    await editOrReply(context, createEmbed("loading", context, `Creating website screenshot...`))

    try {
      const t = Date.now();

      let ss = await webshot(context, args.url, false) // nsfw sites are always blocked

      if (ss.response.body.status && ss.response.body.status !== 3) {
        if (ss.response.body.image) return await editOrReply(context,
          createEmbed("image", context, {
            url: ss.response.body.image,
            time: ((Date.now() - t) / 1000).toFixed(2)
          })
        )
        return await editOrReply(context, createEmbed("error", context, "Unable to create screenshot."))
      }

      return await editOrReply(context, {
        embeds: [createEmbed("image", context, {
          url: "screenshot.png",
          time: ((Date.now() - t) / 1000).toFixed(2)
        })],
        files: [{ filename: "screenshot.png", value: ss.response.body }]
      })
    } catch (e) {
      console.log(e)
      return await editOrReply(context, createEmbed("image", context, {
        url: "https://bignutty.gitlab.io/webstorage4/v2/assets/screenshot/brand-update-2024/scr_unavailable.png"
      }))
    }
  }
};