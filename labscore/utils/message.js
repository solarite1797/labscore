module.exports.editOrReply = function(context, message, disableReference = false){
  // Apply message_reference
  if(!message.message_reference && !disableReference) message.reference = true
  if(!message.allowedMentions) message.allowedMentions = {parse: [], repliedUser: false}
  if(!message.content && !message.embed && !message.embeds && !message.components && !message.files) return context.editOrReply({embeds: [message]})
  return context.editOrReply(message)
}