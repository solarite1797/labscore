const { googleVisionSafetyLabels } = require("../../../labscore/api");
const { getRecentImage } = require("../../../labscore/utils/attachment");
const { createEmbed } = require("../../../labscore/utils/embed");
const { codeblock } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

module.exports = {
  name: 'safetylabels',
  metadata: {
    description: 'Image Safe Search Labels',
    examples: ['labels'],
    category: 'utils',
    usage: 'safetylabels <attachment>'
  },
  run: async (context) => {
    context.triggerTyping();
    let image = await getRecentImage(context, 50)
    if (!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })

    let label = await googleVisionSafetyLabels(context, image)

    let labels = []
    for(const l of Object.keys(label.response.body.labels)){
      labels.push({
        name: l.charAt(0).toUpperCase() + l.slice(1),
        value: label.response.body.labels[l],
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