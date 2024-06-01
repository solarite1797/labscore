const { prideborder } = require("../../../labscore/api");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { getUser } = require("../../../labscore/utils/users");

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'pride',
  label: 'user',
  aliases: ['gay'],
  metadata: {
    description: 'Adds a pride-themed overlay to someones avatar.',
    description_short: 'Pride overlay',
    examples: ['gay labsCore'],
    category: 'image',
    usage: 'pride [<user>]'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.user) args.user = context.userId;
    let u = await getUser(context, args.user)
    if(!u|| !u.user) return editOrReply(context, createEmbed("warning", context, "No users found."))

    const avatar = u.user.avatarUrl + '?size=512'
    try{
      let pride = await prideborder(context, avatar)
      
      return editOrReply(context, {
        embeds: [createEmbed("image", context, {
          url: "pride.png"
        })],
        files: [{ filename: "pride.png", value: pride.response.body }]
      })
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, "Unable to generate overlay."))
    }
  },
};