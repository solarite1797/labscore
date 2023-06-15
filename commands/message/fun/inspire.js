const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const superagent = require('superagent');
const { STATICS } = require('../../../labscore/utils/statics');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'inspire',
  metadata: {
    description: 'Generates a random inspirational quote.',
    description_short: 'Inspirational Quotes',
    examples: ['inspire'],
    category: 'fun',
    usage: `inspire`
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES],
  run: async (context) => {
    await context.triggerTyping();
    try{
      let res = await superagent.get(`https://inspirobot.me/api?generate=true`)
        .set("User-Agent","labscore/2.0")
    
      return await editOrReply(context, {
        embeds: [ createEmbed("image", context, {
          url: res.text,
          provider: {
            icon: STATICS.inspirobot,
            text: "Inspirobot"
          }
        })]
      })
    }catch(e){
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to fetch inspirational quote.`)]})
    }
  }
};