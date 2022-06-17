const { Constants } = require("detritus-client");
const Permissions = Constants.Permissions;

const { icon } = require("../../../labscore/utils/markdown");

// TODO: copy pasted from v1, rework this eventually

module.exports = {
  label: "filter",
  name: "purge",
  metadata: {
    description: 'Removes recent messages in chat. Allows you to optionally filter by message content to remove spam.\n\n`-amount` allows you to specify how many messages should be searched (default: 20)\n`-case` specifies if the provided query should be case sensitive or not (default: true)',
    examples: ['purge Spam -amount 25'],
    category: 'mod',
    usage: 'purge [<content>] [-amount <1-50>] [-case <true|false>]'
  },
  args: [
    {default: 20, name: 'amount', type: 'integer'},
    {default: true, name: 'case', type: 'bool'},
  ],
  permissionsClient: [Permissions.MANAGE_MESSAGES],
  permissions: [Permissions.MANAGE_MESSAGES],
  onPermissionsFailClient: (context) => context.editOrReply(`${icon("failiure_simple")} ${context.message.author.mention}, the bot needs the \`Manage Messages\` permission to run this command.`),
  onPermissionsFail: (context) => context.editOrReply(`${icon("failiure_simple")} ${context.message.author.mention}, you are lacking the permission \`Manage Messages\`.`),
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  permissionsClient: [Permissions.MANAGE_MESSAGES],
  run: async (context, args) => {
    await context.triggerTyping();
    if(args.amount >= 51 || args.amount <= 0){
      return context.editOrReply(`${icon("failiure_simple")} ${context.message.author.mention}, Invalid amount (1-50).`);
    }
    const messages = await context.message.channel.fetchMessages({limit: args.amount});
    let deleteIds = []
    messages.forEach(message => {
      if(args.filter.length >= 1){
        if(message.canDelete){
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
        if(message.canDelete){
          deleteIds.push(message.id)
        }
      }
    })

    if(deleteIds.length == 0){
      return context.editOrReply(`${icon("failiure_simple")} No messages found.`);
    }
    if(deleteIds.length == 1){
      try{
        await context.client.rest.deleteMessage(context.channel.id, deleteIds[0])
        return context.editOrReply(`${icon("success_simple")} Removed \`1\` message.`);
      }catch(e){
        await context.editOrReply(`${icon("failiure_simple")} Something went wrong while attempting to remove \`1\` message.`);
      }
    } else {
      try{
        await context.client.rest.bulkDeleteMessages(context.channel.id, deleteIds)
        return context.editOrReply(`${icon("success_simple")} Removed \`${deleteIds.length}\` messages.`);
      }catch(e){
        await context.editOrReply(`${icon("failiure_simple")} Something went wrong while attempting to remove \`${deleteIds.length}\` messages.`);
      }
    }
  }
};