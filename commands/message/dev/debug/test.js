const { createEmbed } = require("../../../../labscore/utils/embed");
const { editOrReply } = require("../../../../labscore/utils/message");
const { flag } = require("../../../../service/makesweet");
const { getRecentImage } = require("../../../../labscore/utils/attachment");

module.exports = {
  name: 'test',
  label: 'text',
  metadata: {
    description: 'test',
    description_short: 'Bot test',
    examples: ['test'],
    category: 'dev',
    usage: 'test'
  },
  args: [
    { default: false, name: "noreply", type: "bool", help: "Should this command return the output?" },
    { default: 2, name: "jsonspacing", type: "number", help: "JSON spacing sizes" },
    { default: true, name: "async", type: "bool", help: "Compute async?" }
  ],
  run: async (context, args) => {
    if(context.user.id !== "223518178100248576") return;
    let image = await getRecentImage(context, 50)
    if(!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })
    if(!args.text) args.text = ""
    try {
      let mkswt = await flag(image)
      return editOrReply(context, { content:"ww", files: [{
        filename: "makesweet.gif",
        value: mkswt.body
      }] })
    } catch (e) {
      console.log(e)
    }
  },
}