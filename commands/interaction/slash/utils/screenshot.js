const { WebUtilsWebPageScreenshot} = require("#obelisk");

const { createEmbed } = require("#utils/embed");
const { acknowledge } = require("#utils/interactions");
const { editOrReply } = require("#utils/message");

const { ApplicationCommandOptionTypes } = require('detritus-client/lib/constants');

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
    },
    {
      name: 'incognito',
      description: 'Makes the response only visible to you.',
      type: ApplicationCommandOptionTypes.BOOLEAN,
      required: false,
      default: false
    }
  ],
  run: async (context, args) => {
    await acknowledge(context, args.incognito);

    await editOrReply(context, createEmbed("loading", context, `Creating website screenshot...`))

    try {
      const t = Date.now();

      let ss = await WebUtilsWebPageScreenshot(context, args.url, false) // nsfw sites are always blocked

      if (ss.response.body.error) return await editOrReply(context,
          createEmbed("image", context, {
            url: ss.response.body.error.image_url,
            time: ((Date.now() - t) / 1000).toFixed(2)
          })
        )


      return await editOrReply(context, {
        embeds: [createEmbed("image", context, {
          url: "screenshot.png",
          time: ((Date.now() - t) / 1000).toFixed(2)
        })],
        files: [{ filename: "screenshot.png", value: Buffer.from(ss.response.body.image, 'base64') }]
      })
    } catch (e) {
      console.log(e)
      return editOrReply(context, createEmbed("image", context, {
        url: "https://bignutty.gitlab.io/webstorage4/v2/assets/screenshot/brand-update-2024/scr_unavailable.png"
      }))
    }
  }
};