const { createEmbed } = require('../../../../labscore/utils/embed')
const { editOrReply } = require('../../../../labscore/utils/message')
const { STATICS } = require('../../../../labscore/utils/statics')

const { retroWave } = require('../../../../labscore/api')

module.exports = {
  name: 'retro',
  label: 'text',
  metadata: {
    description: 'cyberspace',
    examples: ['retro cyberspace|chaos|crazy'],
    category: 'image',
    usage: 'retro <line1|line2|line3> [-background <1-5>] [-style <1-4>]'
  },
  args: [
    {default: 5, name: 'background', type: 'integer'},
    {default: 4, name: 'style', type: 'integer'},
  ],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.text) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (text).`)]})
    if(args.background > 5 || args.background < 1) return editOrReply(context, {embeds:[createEmbed("warning", context, `Invalid Parameter (background).`)]})
    if(args.style > 4 || args.style < 1) return editOrReply(context, {embeds:[createEmbed("warning", context, `Invalid Parameter (style).`)]})
    let lines = `${args.text}| | `.split('|')
    try{
      let res = await retroWave(context, args.background, args.style, lines[2], lines[0], lines[1])
      
      if(res.response.body.status == 1) return editOrReply(context, {embeds:[createEmbed("warning", context, res.response.body.errors[0])]})

      image = res.response.body.data.images[res.response.body.data.best_quality]
      return editOrReply(context, {embeds:[createEmbed("default", context, {
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
      if(e.response?.body?.message) return editOrReply(context, {embeds:[createEmbed("error", context, e.response.body.message)]})
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate image.`)]})
    }
  }
};