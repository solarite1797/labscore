module.exports.editOrReply = function(context, message, disableReference = false){
  // Apply message_reference
  if(!message.content && !message.embed && !message.embeds && !message.components && !message.files) message = {embeds: [message]}
  if(!message.message_reference && !disableReference) message.reference = true
  // Disable mentions
  if(!message.allowedMentions) message.allowedMentions = {parse: [], repliedUser: false}
  // Only respond if the command is still available.
  if(!context.message.deleted) return context.editOrReply(message)
}