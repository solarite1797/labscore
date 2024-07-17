const { paginator } = require('#client');

const { createEmbed, page } = require("#utils/embed");
const { icon } = require('#utils/markdown');
const { editOrReply } = require("#utils/message");
const { getUser } = require("#utils/users");

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'banner',
  label: 'user',
  aliases: ['b'],
  metadata: {
    description: 'Displays someones profile banner. Accepts IDs, Mentions, or Usernames.',
    description_short: 'Get discord user avatars',
    examples: ['avatar labsCore'],
    category: 'info',
    usage: 'avatar [<user>]',
    slashCommmand: 'banner'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.user) args.user = context.userId;
    let u = await getUser(context, args.user)
    if(!u || !u.user) return editOrReply(context, createEmbed("warning", context, "No users found."))

    if(!u.user.banner && !u.member?.banner) return editOrReply(context, createEmbed("warning", context, "User has no banners."))
    
    let pages = []
    
    if(!u.member?.banner && u.member) u.member = await context.guild.fetchMember(u.user.id)

    if(u.member?.banner) {
      pages.push(page(createEmbed("default", context, {
        image: {
          url: `https://cdn.discordapp.com/guilds/${context.guild.id}/users/${u.member.id}/banners/${u.member.banner}.png` + "?size=4096"
        }
      })))

      pages.push(page(createEmbed("default", context, {
        image: {
          url: u.user.bannerUrl + '?size=4096'
        }
      })))

      await paginator.createPaginator({
        context,
        pages,
        buttons: [{
          customId: "next",
          emoji: icon("button_user_profile_swap"),
          label: "Toggle Server/Global Banner",
          style: 2
        }]
      });
    } else {
      return editOrReply(context, createEmbed("default", context, {
        image: {
          url: u.user.bannerUrl + '?size=4096'
        }
      }))
    }
  },
};