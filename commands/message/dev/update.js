const { Constants, Utils } = require("detritus-client");
const Permissions = Constants.Permissions;

const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { execSync } = require("child_process");
const { highlight } = require("../../../labscore/utils/markdown");

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
      const r = execSync("git pull")
      if(r.toString().includes("Already up to date.")) return await response.edit({embeds: [createEmbed("warning", context, "Already up to date.")]})

      let id = r.toString().match(/(?:.*?)\.\.([a-z0-9]{7})/)[1]
      return await response.edit({embeds: [createEmbed("default", context, {description: `Update complete (${highlight(id)})`})]})
    }catch(e){
      console.log(e)
      return await response.edit({embeds: [createEmbed("error", context, "Update failed.")]})
    }
  }
};