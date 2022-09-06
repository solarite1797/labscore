const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandTypes, MessageFlags } = Constants;

const { createEmbed } = require('../../../labscore/utils/embed');
const { codeblock } = require('../../../labscore/utils/markdown');

const { decode } = require('bottomify')

module.exports = {
  name: 'Decode Bottom',
  type: ApplicationCommandTypes.MESSAGE,
  run: async (context, args) => {
    try{
      const { message } = args;

      let decodedMessage = decode(message.content)

      await context.respond({data: { flags: MessageFlags.EPHEMERAL, embeds: [
        createEmbed("default", context, {
          description: codeblock("py", [decodedMessage])
        })
      ] }, type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE})

    }catch(e){
      console.log(e)
      await context.editOrRespond({
        embeds: [createEmbed("error", context, "Unable to decode message.")],
        flags: MessageFlags.EPHEMERAL
      })
    }
  },
};