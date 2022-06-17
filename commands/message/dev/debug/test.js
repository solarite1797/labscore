const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");
const { flag } = require("../../../../service/makesweet");
const { getRecentImage } = require("../../../../labscore/utils/attachment");

module.exports = {
  name: 'test',
  label: 'text',
  metadata: {
    description: 'test',
    examples: ['test'],
    category: 'dev',
    usage: 'test'
  },
  run: async (context, args) => {
    if(context.user.id !== "223518178100248576") return;
    let image = await getRecentImage(context, 50)
    if(!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })
    if(!args.text) args.text = ""
    try {
      let mkswt = await flag(image)
      console.log(mkswt.body)
      return editOrReply(context, { content:"ww", files: [{
        filename: "makesweet.gif",
        value: mkswt.body
      }] })
    } catch (e) {
      console.log(e)
    }
  },
}