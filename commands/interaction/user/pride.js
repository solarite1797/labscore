const { prideborder } = require("../../../labscore/api");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");

const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandTypes } = Constants;

module.exports = {
  name: 'Create Pride Avatar 🌈',
  type: ApplicationCommandTypes.USER,
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  run: async (context, args) => {
    try{
      await context.respond({ data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE })

      try{
        let pride = await prideborder(context, args.user.avatarUrl + '?size=512')
        
        return editOrReply(context, {
          embeds: [createEmbed("image", context, {
            url: "pride.png"
          })],
          files: [{ filename: "pride.png", value: pride.response.body }]
        })
      }catch(e){
        console.log(e)
        return editOrReply(context, createEmbed("error", context, "Unable to generate overlay."))
      }

      return editOrReply(context, createEmbed("default", context, {
        image: {
          url: args.user.avatarUrl + '?size=4096'
        }
      }))
    }catch(e){
      console.log(e)
    }
  },
};