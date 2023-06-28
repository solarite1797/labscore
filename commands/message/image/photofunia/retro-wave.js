const { createEmbed } = require('../../../../labscore/utils/embed')
const { editOrReply } = require('../../../../labscore/utils/message')
const { STATICS } = require('../../../../labscore/utils/statics')

const { retroWave } = require('../../../../labscore/api')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'retro',
  label: 'text',
  metadata: {
    description: 'Generates an image with a retro style.',
    description_short: 'Retro-styled text',
    examples: ['retro cyberspace|chaos|crazy'],
    category: 'image',
    usage: 'retro <line1|line2|line3> [-background <1-5>] [-style <1-4>]'
  },
  args: [
    {default: 5, name: 'background', type: 'integer', help: "Background Style ` 1, 2, 3, 4, 5 `"},
    {default: 4, name: 'style', type: 'integer', help: "Text Style ` 1, 2, 3, 4 `"},
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})
    if(args.background > 5 || args.background < 1) return editOrReply(context, {embeds:[createEmbed("warning", context, `Invalid Parameter (background).`)]})
    if(args.style > 4 || args.style < 1) return editOrReply(context, {embeds:[createEmbed("warning", context, `Invalid Parameter (style).`)]})
    let lines = `${args.text}| | `.split('|')
    if(args.text.includes('|')) lines = [lines[1], lines[2], lines[0]]
    try{
      let res = await retroWave(context, args.background, args.style, lines[2], lines[0], lines[1])
      
      if(res.response.body.status == 1) return editOrReply(context, {embeds:[createEmbed("warning", context, res.response.body.errors[0])]})

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
      if(e.response?.body?.message) return editOrReply(context, {embeds:[createEmbed("error", context, e.response.body.message)]})
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate image.`)]})
    }
  }
};