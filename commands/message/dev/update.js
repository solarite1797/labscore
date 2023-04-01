const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { execSync } = require("child_process");
const { icon, highlight } = require('../../../labscore/utils/markdown');

module.exports = {
  name: "update",
  metadata: {
    description: 'Fetches latest bot version.',
    description_short: 'Bot update',
    examples: ['update'],
    category: 'dev',
    usage: 'update [-force true]'
  },
  args: [
    { default: false, name: "force", type: "bool", help: "Force update" }
  ],
  onBefore: context => context.user.isClientOwner,
  onCancel: ()=>{},
  run: async (context, args) => {
    let response = await editOrReply(context, createEmbed("loading", context, "Updating bot..."))
    try{
      const t = Date.now()
      if(args.force) execSync("git checkout .")
      const r = execSync("git pull")
      if(r.toString().includes("Already up to date.")) return await response.edit({embeds: [createEmbed("warning", context, "Already up to date.")]})

      let com = r.toString().match(/([a-z0-9]{7})\.\.([a-z0-9]{7})/)
      return await response.edit({ content: `${icon("success_simple")} Updated ${highlight(com[1] + ' -> ' + com[2])} in ${((Date.now() - t) / 1000).toFixed(2)}s`, embeds: []})
    }catch(e){
      console.log(e)
      return await response.edit({embeds: [createEmbed("error", context, "Update failed.")]})
    }
  }
};