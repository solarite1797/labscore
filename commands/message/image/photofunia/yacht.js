const { createEmbed } = require('../../../../labscore/utils/embed')
const { editOrReply } = require('../../../../labscore/utils/message')
const { STATICS } = require('../../../../labscore/utils/statics')

const { yacht } = require('../../../../labscore/api')

module.exports = {
  name: 'yacht',
  label: 'text',
  metadata: {
    description: 'crazy yacht',
    examples: ['yacht Im on a boat.'],
    category: 'image',
    usage: 'yacht <text>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})
    if(args.text.length >= 26) return editOrReply(context, {embeds:[createEmbed("warning", context, `Parameter text too long (>25).`)]})
    try{
      let res = await yacht(context, args.text)
      image = res.response.body.data.images[res.response.body.data.best_quality]
      return editOrReply(context, {embeds:[createEmbed("default", context, {
        description: `⛵`,
        image: {
          url: image
        },
        footer: {
          iconUrl: STATICS.photofunia,
          text: `PhotoFunia • ${context.application.name} • Took ${res.timings}s`
        }
      })]})
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate image.`)]})
    }
  }
};