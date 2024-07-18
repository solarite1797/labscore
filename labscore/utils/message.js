const { Permissions, MessageFlags } = require("detritus-client/lib/constants")
const { basecamp } = require("../logging")
const { createEmbed } = require("./embed")
const { COLORS } = require("#constants")
const { icon, link } = require("./markdown")

/**
 * These will force the command to become "incognito".
 */
const BLOCK_REASONS = {
  20016: {
    message: "the channel's slowmode settings",
    support_article: 360016150952
  },
  200000: {
    message: "the server's AutoMod setup",
    support_article: 4421269296535
  },
  // TODO: Handle permissions properly, this works as a "hack" for now.
  50013: {
    message: "the channel's permission setup",
    support_article: 10543994968087
  }
}

module.exports.editOrReply = function(context, message, disableReference = false){
  // Apply message_reference
  if(!message.content && !message.embed && !message.embeds && !message.components && !message.files && typeof(message) == "object") message = {embeds: [message]};
  else if(typeof(message) == "string") message = { content: message };
  if(!message.message_reference && !disableReference) message.reference = true
  // Disable mentions
  if(!message.allowedMentions) message.allowedMentions = {parse: [], repliedUser: false}

  let flags = 0;
  
  // Special labsCore context clues for the command.
  // Currently only used to identify incognito requests
  // on user slash commands.
  if(context._meta){
    if(context._meta.isIncognito) flags = MessageFlags.EPHEMERAL
  }
  
  message.flags = flags;

  // Handle responses for interaction context
  if(context.editOrRespond){
    if(context._meta?.replacementMessageId){
      return context.editMessage(context._meta.replacementMessageId, message).catch((e)=>{
        basecamp(`<:ico_w3:1086624963047460874>\`[${process.env.HOSTNAME}]\` **\` SHARD_MESSAGE_ERROR  \`** \`[Shard ${context.client.shardId}]\` Command \`${context.command.name}\` failed to respond: @ \`${Date.now()}\`\nGuild: \`${context.guild?.id}\`\nChannel: \`${context.channel?.id}\`\nUser: \`${context.user?.id}\`\`\`\`js\n${e}\`\`\``, message)
      });
    }
  
    return context.editOrRespond(message).catch(async (e)=>{
      const errorData = await e.response.json();
      if(BLOCK_REASONS[errorData.code]){
        // Delete the public response
        await context.deleteResponse();
  
        message.flags = MessageFlags.EPHEMERAL

        // Create a notice
        if(message.content){
          if(message.embeds && message.embeds.length <= 4){
            message.embeds.unshift({
              description: `${icon("flask_incognito")} ​  ​  This response has been made incognito due to ${BLOCK_REASONS[errorData.code].message}.`,
              color: COLORS.incognito
            })
          }
        } else {
          // Uses new subtext formatting to look more "native"
          message.content = `-# ${icon("flask_mini")} This response has been made incognito due to ${BLOCK_REASONS[errorData.code].message}. ${link("https://support.discord.com/hc/en-us/articles/" + BLOCK_REASONS[errorData.code].support_article, "Learn More", "Support Article")}`
        }

        let replacementMessage = await context.createMessage(message);
        
        if(!context._meta) context._meta = {}
        context._meta.replacementMessageId = replacementMessage.id;
  
        return replacementMessage;
        
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