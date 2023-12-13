const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const superagent = require('superagent');

const { Permissions } = require("detritus-client/lib/constants");
const { otter } = require('../../../labscore/api');

module.exports = {
  name: 'otter',
  metadata: {
    description: 'Displays a random image containing otters.',
    description_short: 'Otter images',
    category: 'fun',
    usage: `otter`
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    await context.triggerTyping();
    try{
      const ott = (await otter()).response.body
    
      return editOrReply(context, createEmbed("default", context, {
        image: {
          url: ott.url
        }
      }))
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to fetch otter.`))
    }
  }
};