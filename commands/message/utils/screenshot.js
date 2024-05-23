const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");

const superagent = require('superagent')

const { Permissions } = require("detritus-client/lib/constants");
const { WebUtilsWebPageScreenshot} = require("../../../labscore/api/obelisk");

async function processJob(jobUrl) {
  let job = await superagent.get(jobUrl)
    .set('User-Agent', 'labscore/1.0')

  return job.body;
}

module.exports = {
  label: "url",
  name: "screenshot",
  aliases: ['ss'],
  metadata: {
    description: 'Takes screenshots of a website.',
    description_short: 'Screenshot websites.',
    examples: ['ss google.com'],
    category: 'utils',
    usage: 'screenshot <url>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.ATTACH_FILES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if (!args.url) return editOrReply(context, createEmbed("warning", context, "No url supplied."))

    await editOrReply(context, createEmbed("loading", context, `Creating website screenshot...`))

    try {
      const t = Date.now();

      let ss = await WebUtilsWebPageScreenshot(context, args.url, false)

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
      return await editOrReply(context, createEmbed("image", context, {
        url: "https://bignutty.gitlab.io/webstorage4/v2/assets/screenshot/brand-update-2024/scr_unavailable.png"
      }))
    }
  }
};