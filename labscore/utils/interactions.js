const { MessageFlags, InteractionCallbackTypes } = require("detritus-client/lib/constants")

const { Context } = require("detritus-client/lib/command")
const { InteractionContext } = require("detritus-client/lib/interaction")

/**
 * Acknowledges a command or interaction.
 * @param { InteractionContext|Context } context Command/interaction context
 * @param { boolean } incognito Specifies if the interaction should run privately (only applicable for interactions)
 */
module.exports.acknowledge = async function(context, incognito = false){
  // Interaction flow
  if(context.editOrRespond){
    if(incognito){
      if(!context._meta) context._meta = {};
      context._meta.isIncognito = true;
      return await context.respond({data: { flags: MessageFlags.EPHEMERAL }, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE});
    }
    return await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})
  }
  // Command Flow
  return await context.triggerTyping()
}