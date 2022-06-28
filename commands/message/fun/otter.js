const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const superagent = require('superagent');

module.exports = {
  name: 'otter',
  metadata: {
    description: 'random otter!!',
    examples: ['otter'],
    category: 'fun',
    usage: `otter`
  },
  run: async (context, args) => {
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