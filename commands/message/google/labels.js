const { googleVisionLabels } = require("../../../labscore/api");
const { getRecentImage } = require("../../../labscore/utils/attachment");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

module.exports = {
  name: 'labels',
  metadata: {
    description: 'Applies labels to an image based on its visual contents.',
    examples: ['labels'],
    category: 'utils',
    usage: 'labels <attachment>'
  },
  run: async (context) => {
    context.triggerTyping();
    let image = await getRecentImage(context, 50)
    if (!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })

    let label = await googleVisionLabels(context, image)

    let labels = []
    for(const l of label.response.body.labels){
      labels.push({
        name: l.name,
        value: `${l.score.toString().substr(2,2)}.${l.score.toString().substr(3,1)}%`,
        inline: true
      })
    }
    return editOrReply(context, {
      embeds: [createEmbed("default", context, {
        fields: labels,
        thumbnail: {
          url: image
        },
        footer: {
          iconUrl: STATICS.google,
          text: `Google Cloud Vision • ${context.application.name} • Took ${label.timings}s`
        }
      })]
    })
  },
};