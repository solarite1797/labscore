
const { createEmbed } = require("#utils/embed");
const { editOrReply } = require("#utils/message");
const { icon } = require("#utils/markdown");

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

// TODO: rework this eventually
// -> filter by user
module.exports = {
  label: "filter",
  name: "purge",
  metadata: {
    description: `Removes recent messages in chat. Allows you to optionally filter by message content to remove spam.`,
    description_short: 'Mass-delete recent messages',
    examples: ['purge Spam -amount 25'],
    category: 'mod',
    usage: 'purge [<content>] [-amount <1-50>] [-case <true|false>]'
  },
  args: [
    {default: 20, name: 'amount', type: 'integer', help: "Amount of messages to be checked (1-20)"},
    {default: true, name: 'case', type: 'bool', help: "If provided, should the search query be case sensitive"},
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.MANAGE_MESSAGES, Permissions.READ_MESSAGE_HISTORY],
  permissions: [Permissions.MANAGE_MESSAGES],
  onPermissionsFail: (context) => editOrReply(context, {content: `${icon("failiure_simple")} ${context.message.author.mention}, you are lacking the permission \`Manage Messages\`.`}),
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  permissionsClient: [Permissions.MANAGE_MESSAGES],
  run: async (context, args) => {
    await context.triggerTyping();
    if(isNaN(parseInt(args.amount))) return editOrReply(context, createEmbed("warning", context, "Invalid Amount"))
    
    if(args.amount >= 51 || args.amount <= 0){
      return editOrReply(context, { content: `${icon("failiure_simple")} ${context.message.author.mention}, Invalid amount (1-50).`});
    }
    const messages = await context.message.channel.fetchMessages({limit: args.amount});
    let deleteIds = []
    messages.forEach(message => {
      if(args.filter.length >= 1){
        if(message.canDelete && (Date.now() - new Date(message.timestamp)) <= 1209000000){
          if(args.case == false){
            if(message.content.toLowerCase().includes(args.filter.toLowerCase())){
              deleteIds.push(message.id)
            }
          } else {
            if(message.content.includes(args.filter)){
              deleteIds.push(message.id)
            }
          }
        }
      } else {
        if(message.canDelete && (Date.now() - new Date(message.timestamp)) <= 1209000000){
          deleteIds.push(message.id)
        }
      }
    })

    if(deleteIds.length == 0){
      return editOrReply(context, {content:`${icon("failiure_simple")} No messages found.`});
    }
    if(deleteIds.length == 1){
      try{
        await context.client.rest.deleteMessage(context.channel.id, deleteIds[0])
        return editOrReply(context, { content: `${icon("success_simple")} Removed \`1\` message.`});
      }catch(e){
        await editOrReply(context, { content: `${icon("failiure_simple")} Something went wrong while attempting to remove \`1\` message.`});
      }
    } else {
      try{
        await context.client.rest.bulkDeleteMessages(context.channel.id, deleteIds)
        return editOrReply(context, {content: `${icon("success_simple")} Removed \`${deleteIds.length}\` messages.`});
      }catch(e){
        await editOrReply(context, {content:`${icon("failiure_simple")} Something went wrong while attempting to remove \`${deleteIds.length}\` messages.`});
      }
    }
  }
};