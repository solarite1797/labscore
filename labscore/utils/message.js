const { Permissions } = require("detritus-client/lib/constants")
const { basecamp } = require("../logging")

module.exports.editOrReply = function(context, message, disableReference = false){
  // Apply message_reference
  if(!message.content && !message.embed && !message.embeds && !message.components && !message.files) message = {embeds: [message]}
  if(!message.message_reference && !disableReference) message.reference = true
  // Disable mentions
  if(!message.allowedMentions) message.allowedMentions = {parse: [], repliedUser: false}

  // you can figure out what this does on your own time
  //message.nonce = Math.floor(Math.random() * 9999 + 1000)

  // Handle responses for interaction context
  if(context.editOrRespond){
    return context.editOrRespond(message).catch((e)=>{
      basecamp(`<:ico_w3:1086624963047460874>\`[${process.env.HOSTNAME}]\` **\` SHARD_MESSAGE_ERROR  \`** \`[Shard ${context.client.shardId}]\` Command \`${context.command.name}\` failed to respond: @ \`${Date.now()}\`\nGuild: \`${context.guild.id}\`\nChannel: \`${context.channel.id}\`\nUser: \`${context.user.id}\`\`\`\`js\n${e}\`\`\``)
    })
  }
  // Only respond if the command is still available and we have permissions to respond.
  if(!context.message.deleted && context.channel.can(Permissions.SEND_MESSAGES)) return context.editOrReply(message).catch((e)=>
    basecamp(`<:ico_w3:1086624963047460874>\`[${process.env.HOSTNAME}]\` **\` SHARD_MESSAGE_ERROR  \`** \`[Shard ${context.client.shardId}]\` Command \`${context.message.content}\` failed to reply: @ \`${Date.now()}\`\nGuild: \`${context.guild.id}\`\nChannel: \`${context.channel.id}\`\nUser: \`${context.user.id}\`\`\`\`js\n${e}\`\`\``)
  )
}