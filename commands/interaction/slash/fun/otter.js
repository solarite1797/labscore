const { createEmbed } = require('../../../../labscore/utils/embed')
const { editOrReply } = require('../../../../labscore/utils/message')

const { InteractionCallbackTypes } = require("detritus-client/lib/constants");
const { otter } = require('../../../../labscore/api');

module.exports = {
  description: 'Shows a random otter picture.',
  name: 'otter',
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  run: async (context) => {
    await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

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