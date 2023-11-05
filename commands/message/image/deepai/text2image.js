const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");

const { text2image } = require('../../../../labscore/api');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'text2image',
  label: 'text',
  aliases: ['t2i'],
  metadata: {
    description: 'Generates an image with DeepAI Text2Image using a text prompt.',
    description_short: 'Image from text prompt',
    category: 'broken',
    usage: 'text2image <image>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    return;
    context.triggerTyping();
    try{
      if(!args.text) return editOrReply(context, createEmbed("warning", context, "Missing parameter (text)."))

      let res = await text2image(context, args.text)

      if(res.response.body.status == 1) return editOrReply(context, createEmbed("warning", context, res.response.body.errors[0]))    
      
      return editOrReply(context, createEmbed("image", context, {
        url: res.response.body.image,
        time: res.timings
      }))
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Text2image timed out.`))
    }
  },
};