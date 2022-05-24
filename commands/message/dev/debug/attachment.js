const { getRecentImage } = require("../../../../labscore/utils/attachment");
const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

module.exports = {
  name: 'attachment',
  metadata: {
    description: 'test',
    examples: ['attachment'],
    category: 'dev',
    usage: 'attachment'
  },
  run: async (context) => {
    try{
      
    let image = await getRecentImage(context, 50)
    if(!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })
    return editOrReply(context, { embeds: [createEmbed("default", context, {
      image: {
        url: image
      }
    })] })
    }catch(e){
      console.log(e)
    }
  },
};