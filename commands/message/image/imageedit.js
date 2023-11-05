const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { getRecentImage } = require("../../../labscore/utils/attachment");

const superagent = require('superagent');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'editimage',
  label: 'prompt',
  aliases: ['ei'],
  metadata: {
    description: 'Edits an image using AI.',
    description_short: 'AI image editing',
    examples: ['editimage Wearing a crown'],
    category: 'broken',
    usage: 'editimage <prompt>'
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    return;
    if (!args.prompt) return editOrReply(context, createEmbed("warning", context, "Missing prompt."))

    let image = await getRecentImage(context, 50)
    if (!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

    let response = await editOrReply(context, createEmbed("loading", context, `Editing image...`))

    let noticeTimer = setTimeout(() => {
      let emb = createEmbed("loading", context, `Editing image...`)
      emb.footer = {
        text: "This might take several minutes to complete."
      };
      response.edit({ embeds: [emb] });
    }, 45000)

    try {
      let img = await superagent.get(`${process.env.AI_SERVER}/deepai/imageeditor`)
        .query({
          prompt: args.prompt,
          url: image
        })

      clearTimeout(noticeTimer)

      let imageData = await superagent.get(img.body.image)

      return editOrReply(context, {
        embeds: [createEmbed("image", context, {
          url: "edited.jpg"
        })],
        files: [{ filename: "edited.jpg", value: imageData.body }]
      })
    } catch (e) {
      console.log(e)
      clearTimeout(noticeTimer)
      await response.edit({ embeds: [createEmbed("error", context, `Image generation failed.`)] })
    }
  },
};