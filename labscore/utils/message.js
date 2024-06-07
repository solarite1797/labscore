const { Permissions } = require("detritus-client/lib/constants")
const { basecamp } = require("../logging")
const { createEmbed } = require("./embed")

module.exports.editOrReply = function(context, message, disableReference = false){
  // Apply message_reference
  if(!message.content && !message.embed && !message.embeds && !message.components && !message.files && typeof(message) == "object") message = {embeds: [message]};
  else if(typeof(message) == "string") message = { content: message };
  if(!message.message_reference && !disableReference) message.reference = true
  // Disable mentions
  if(!message.allowedMentions) message.allowedMentions = {parse: [], repliedUser: false}

  // you can figure out what this does on your own time
  message.nonce = Math.floor(Math.random() * 9999 + 1000)

  // Handle responses for interaction context
  if(context.editOrRespond){
    return context.editOrRespond(message).catch((e)=>{
      /*
        Discord in their infinite wisdom decided that *bots* should
        be the one to handle automod errors on their own, deciding
        against adding a notice/response type for their frontend.

        This is the awesome solution to this problem, that isn't
        actually very awesome and actually sucks a lot.
      */
      if(e.code === 200000){
        try{
          let embedResponse = createEmbed("error", context, "Response was filtered by AutoMod.")
          embedResponse.description = `Try running the command somewhere else or ask server admins for help.`
          return context.editOrRespond({
            allowedMentions: { parse: [], repliedUser: false },
            embeds: [
              embedResponse
            ]
          })
        }catch(e){
          /*
            another error? suck it.
            there is genuinely nothing left that we can do.

            create followup message has an awesome 'hack' that prevents
            the bot from creating a new ephemeral followup response
            if the original one isn't/couldn't be acknowledged.

            https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message
          */ 
        }
      }
      basecamp(`<:ico_w3:1086624963047460874>\`[${process.env.HOSTNAME}]\` **\` SHARD_MESSAGE_ERROR  \`** \`[Shard ${context.client.shardId}]\` Command \`${context.command.name}\` failed to respond: @ \`${Date.now()}\`\nGuild: \`${context.guild?.id}\`\nChannel: \`${context.channel?.id}\`\nUser: \`${context.user?.id}\`\`\`\`js\n${e}\`\`\``, message)
    })
  }

  // Only respond if the command is still available and we have permissions to respond.
  if(!context.message.deleted && context.channel.can(Permissions.SEND_MESSAGES)) return context.editOrReply(message).catch((e)=>{   
    console.log(e.status)
    basecamp(`<:ico_w3:1086624963047460874>\`[${process.env.HOSTNAME}]\` **\` SHARD_MESSAGE_ERROR  \`** \`[Shard ${context.client.shardId}]\` Command \`${context.message?.content}\` failed to reply: @ \`${Date.now()}\`\nGuild: \`${context.guild?.id}\`\nChannel: \`${context.channel?.id}\`\nUser: \`${context.user?.id}\`\`\`\`js\n${e}\`\`\``, message)
})
}