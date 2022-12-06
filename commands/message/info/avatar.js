const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { getUser } = require("../../../labscore/utils/users");

module.exports = {
  name: 'avatar',
  label: 'user',
  aliases: ['a'],
  metadata: {
    description: 'Displays someones discord avatar. Accepts IDs, Mentions, or Usernames.',
    description_short: 'User avatar',
    examples: ['avatar labsCore'],
    category: 'info',
    usage: 'avatar [<user>]'
  },
  run: async (context, args) => {
    context.triggerTyping();
    let u = {};
    if(!args.user) { u.user = context.user } else { u = await getUser(context, args.user) }
    if(!u.user) return editOrReply(context, { embeds: [createEmbed("warning", context, "No users found.")] })
    return editOrReply(context, { embeds: [createEmbed("default", context, {
      image: {
        url: u.user.avatarUrl + '?size=4096'
      }
    })] })
  },
};