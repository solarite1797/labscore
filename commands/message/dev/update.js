const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { execSync } = require("child_process");
const { icon, highlight, smallPill } = require('../../../labscore/utils/markdown');

module.exports = {
  name: "update",
  label: "flags",
  metadata: {
    description: `Fetches latest bot version.\nUse ${smallPill('-f')} to force an update.`,
    description_short: 'Bot update',
    examples: ['update -f'],
    category: 'dev',
    usage: 'update [-f]'
  },
  onBefore: context => context.user.isClientOwner,
  onCancel: ()=>{},
  run: async (context, args) => {
    let response = await editOrReply(context, createEmbed("loading", context, "Updating bot..."))
    try{
      const t = Date.now()
      if(args.flags.includes('-force') || args.flags.includes('-f')) execSync("git checkout .")
      const r = execSync("git pull")
      if(r.toString().includes("Already up to date.")) return await editOrReply(context, {embeds: [createEmbed("warning", context, "Already up to date.")]})

      let com = r.toString().match(/([a-z0-9]{7})\.\.([a-z0-9]{7})/)
      return await editOrReply(context, { content: `${icon("success_simple")} Updated ${highlight(com[1] + ' -> ' + com[2])} in ${((Date.now() - t) / 1000).toFixed(2)}s`, embeds: []})
    }catch(e){
      console.log(e)
      return await editOrReply(context, createEmbed("error", context, "Update failed. Use -f to force update."))
    }
  }
};