const { Constants, Utils } = require("detritus-client");
const Permissions = Constants.Permissions;

const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { execSync } = require("child_process")

module.exports = {
  name: "update",
  metadata: {
    description: 'update bot',
    examples: ['update'],
    category: 'dev',
    usage: 'update'
  },
  onBefore: context => context.user.isClientOwner,
  onCancel: context =>
    context.reply(
      `${context.user.mention}, you are lacking the permission \`BOT_OWNER\`.`
    ),
  run: async (context, args) => {
    await context.triggerTyping();
    let response = await editOrReply(context, createEmbed("loading", context, "Updating bot..."))
    try{
      execSync("git pull")
      return await response.edit({embeds: [createEmbed("success", context, "Update complete.")]})
    }catch(e){
      return await response.edit({embeds: [createEmbed("error", context, "Update failed.")]})
    }
  }
};