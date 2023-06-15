const { createEmbed } = require('../../../../labscore/utils/embed')
const { editOrReply } = require('../../../../labscore/utils/message')
const { STATICS } = require('../../../../labscore/utils/statics')

const { yacht } = require('../../../../labscore/api')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'yacht',
  label: 'text',
  metadata: {
    description: 'Generates an image with custom text on a yacht.',
    description_short: 'Custom text on a yacht',
    examples: ['yacht Im on a boat.'],
    category: 'image',
    usage: 'yacht <text>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})
    if(args.text.length >= 26) return editOrReply(context, {embeds:[createEmbed("warning", context, `Parameter text too long (>25).`)]})
    try{
      let res = await yacht(context, args.text)
      image = res.response.body.data.images[res.response.body.data.best_quality]
      
      return editOrReply(context, createEmbed("image", context, {
        url: image,
        time: res.timings,
        provider: {
          icon: STATICS.photofunia,
          text: "PhotoFunia"
        }
      }))
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate image.`)]})
    }
  }
};