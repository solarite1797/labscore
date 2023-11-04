const { googleVisionSafetyLabels } = require("../../../labscore/api");
const { GOOGLE_CLOUD_SAFETY_LABELS, GOOGLE_CLOUD_SAFETY_LABELS_NAMES } = require("../../../labscore/constants");
const { getRecentImage } = require("../../../labscore/utils/attachment");
const { createEmbed } = require("../../../labscore/utils/embed");
const { iconPill, smallPill } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'safetylabels',
  metadata: {
    description: 'Applies detection labels for potentially sensitive content of an image.',
    description_short: 'Sentivite content detection labels',
    category: 'utils',
    usage: 'safetylabels <attachment>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    context.triggerTyping();
    let image = await getRecentImage(context, 50)
    if (!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

    let label = await googleVisionSafetyLabels(context, image)

    let labels = []
    for (const l of Object.keys(label.response.body.labels)) {
      let rating = GOOGLE_CLOUD_SAFETY_LABELS[label.response.body.labels[l]]
      labels.push([
        smallPill(GOOGLE_CLOUD_SAFETY_LABELS_NAMES[l]),
        iconPill(rating.icon, rating.name)
      ].join(' ​ ​'))
    }
    return editOrReply(context, createEmbed("default", context, {
      description: labels.join('\n'),
      thumbnail: {
        url: image
      },
      footer: {
        iconUrl: STATICS.google,
        text: `Google Cloud Vision • ${context.application.name}`
      }
    }))
  },
};