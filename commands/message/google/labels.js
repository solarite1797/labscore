const { googleVisionLabels } = require("../../../labscore/api");
const { getRecentImage } = require("../../../labscore/utils/attachment");
const { createEmbed } = require("../../../labscore/utils/embed");
const { pill, smallPill } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'labels',
  metadata: {
    description: 'Applies labels to an image based on its visual contents.',
    description_short: 'Image content label detection',
    category: 'utils',
    usage: 'labels <attachment>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    context.triggerTyping();
    let image = await getRecentImage(context, 50)
    if (!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

    let label = await googleVisionLabels(context, image)

    let labels = []
    for (const l of label.response.body.labels) {
      labels.push(smallPill(`${l.score.toString().substr(2, 2)}.${l.score.toString().substr(3, 1)}%`) + ' ​ ​' + pill(l.name))
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