const { createEmbed } = require("../../../../labscore/utils/embed");
const { link } = require("../../../../labscore/utils/markdown");
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
    return editOrReply(context, createEmbed("default", context, {
      description: `${link("https://google.com","Masked Link","Masked Link Tooltip")}`
    }))
    }catch(e){
      console.log(e)
    }
  },
};