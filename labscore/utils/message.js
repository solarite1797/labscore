module.exports.editOrReply = function(context, message, disableReference = false){
  // Apply message_reference
  if(!message.message_reference && !disableReference) message.reference = true
  if(!message.allowedMentions) message.allowedMentions = {parse: [], repliedUser: false}
  return context.editOrReply(message)
}