const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");
const { getUser } = require("../../../../labscore/utils/users");

module.exports = {
  name: 'test',
  label: 'input',
  metadata: {
    description: 'test',
    examples: ['test'],
    category: 'dev',
    usage: 'test'
  },
  run: async (context, args) => {
    try{
      
    let u = await getUser(context, args.input)
    if(!u) return editOrReply(context, { embeds: [createEmbed("warning", context, "No users found.")] })
    return editOrReply(context, { embeds: [createEmbed("default", context, {
      description: u.mention
    })] })
    }catch(e){
      console.log(e)
    }
  },
};