const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const superagent = require('superagent');

const { Permissions } = require("detritus-client/lib/constants");

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
      let res = await superagent.get(`https://otter.bruhmomentlol.repl.co/random`)
        .set("User-Agent","labscore/2.0")
    
      return await editOrReply(context, {
        embeds: [ createEmbed("image", context, {
          url: `otter.${res.headers["x-file-ext"]}`
        })],
        files: [{ filename: `otter.${res.headers["x-file-ext"]}`, value: res.body }]
      })
    }catch(e){
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to fetch otter.`)]})
    }
  }
};