const { paginator } = require('#client');

const { createEmbed, page } = require("#utils/embed");
const { editOrReply } = require("#utils/message");
const { getUser } = require("#utils/users");

// TODO: Turn this into a general purpose permissions constant
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
    usage: 'avatar [<user>]',
    slashCommmand: 'avatar'
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