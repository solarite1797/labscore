const { Permissions } = require("detritus-client/lib/constants")
const { basecamp } = require("../logging")

module.exports.editOrReply = function(context, message, disableReference = false){
  // Apply message_reference
  if(!message.content && !message.embed && !message.embeds && !message.components && !message.files) message = {embeds: [message]}
  if(!message.message_reference && !disableReference) message.reference = true
  // Disable mentions
  if(!message.allowedMentions) message.allowedMentions = {parse: [], repliedUser: false}
  // Only respond if the command is still available and we have permissions to respond.
  if(!context.message.deleted && context.channel.can(Permissions.SEND_MESSAGES)) return context.editOrReply(message).catch((e)=>
    basecamp(`<:ico_w3:1086624963047460874>\`[${process.env.HOSTNAME}]\` **\` SHARD_MESSAGE_ERROR  \`** \`[Shard ${context.client.shardId}]\` Command \`${context.command.name}\` failed to reply: @ \`${Date.now()}\`\n\`\`\`js\n${e}\`\`\``)
  )
}