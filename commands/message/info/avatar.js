const { createEmbed, page } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { getMember } = require("../../../labscore/utils/users");

const { paginator } = require('../../../labscore/client');

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
    if(!args.user) args.user = context.userId;
    let u = await getMember(context, args.user)
    if(!u) return editOrReply(context, { embeds: [createEmbed("warning", context, "No users found.")] })

    if(u.avatar !== null) {
      let pages = []
      pages.push(page(createEmbed("default", context, {
        image: {
          url: u.avatarUrl + '?size=4096'
        }
      })))

      pages.push(page(createEmbed("default", context, {
        image: {
          url: u.user.avatarUrl + '?size=4096'
        }
      })))

      const paging = await paginator.createPaginator({
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