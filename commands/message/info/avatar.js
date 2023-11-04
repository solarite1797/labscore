const { createEmbed, page } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { getMember, getUser } = require("../../../labscore/utils/users");

const { paginator } = require('../../../labscore/client');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'avatar',
  label: 'user',
  aliases: ['a','pfp'],
  metadata: {
    description: 'Displays someones discord avatar. Accepts IDs, Mentions, or Usernames.',
    description_short: 'Get discord user avatars',
    examples: ['avatar labsCore'],
    category: 'info',
    usage: 'avatar [<user>]'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.user) args.user = context.userId;
    let u = await getUser(context, args.user)
    if(!u || !u.user) return editOrReply(context, createEmbed("warning", context, "No users found."))

    if(u.member && u.member.avatar !== null) {
      let pages = []
      pages.push(page(createEmbed("default", context, {
        image: {
          url: u.member.avatarUrl + '?size=4096'
        }
      })))

      pages.push(page(createEmbed("default", context, {
        image: {
          url: u.user.avatarUrl + '?size=4096'
        }
      })))

      await paginator.createPaginator({
        context,
        pages,
        buttons: [{
          customId: "next",
          emoji: "<:images:1063477061156605982>",
          label: "Toggle Server/Profile",
          style: 1
        }]
      });
    } else {
      return editOrReply(context, createEmbed("default", context, {
        image: {
          url: u.user.avatarUrl + '?size=4096'
        }
      }))
    }
  },
};