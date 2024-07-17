const { paginator } = require("#client");
const { BADGE_ICONS } = require("#constants");

const { createEmbed, page } = require("#utils/embed");
const { icon, highlight, timestamp, smallIconPill, smallPill } = require("#utils/markdown");
const { editOrReply } = require("#utils/message");
const { getUser, renderBadges } = require("#utils/users");

// TODO: Turn this into a general purpose permissions constant
const { UserFlags, Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'user',
  label: 'user',
  aliases: ['u', 'profile', 'userinfo', 'ui'],
  metadata: {
    description: 'Displays information about a discord user. Accepts IDs, Mentions and Usernames.',
    description_short: 'Information about discord users',
    examples: ['user labsCore'],
    category: 'info',
    usage: 'user [<user>]',
    slashCommand: 'user'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => { 
    context.triggerTyping();
    try{
      let u;
      if(!args.user) { args.user = context.user.id }
      
      if(args.user == "456226577798135808") return editOrReply(context, createEmbed("error", context, "This user has been deleted."))

      user = await getUser(context, args.user)
      u = user.user
      if(!u) return editOrReply(context, createEmbed("warning", context, "No users found."))
      let m = user.member
      
      // User Card

      // TODO: create bot tag emoji for this
      let botTag = ''
      if(u.bot) botTag = ""
      if(u.hasFlag(UserFlags.VERIFIED_BOT)) botTag = ""

      let usernameDisplay = u.name
      if(u.discriminator && u.discriminator !== "0") usernameDisplay += `#${u.discriminator}`

      usernameDisplay = `**@${usernameDisplay}**${botTag} ${highlight(`(${u.id})`)}`

      if(u.globalName !== null) usernameDisplay += `\n${smallIconPill("user_card", "Display Name")} ${smallPill(u.globalName)}`
      if(m && m.nick !== null) usernameDisplay += `\n${smallIconPill("user_card", "Nickname")} ${smallPill(m.nick)}`

      let userCard = createEmbed("default", context, {
        description: `${icon("user")} ${usernameDisplay}`,
        thumbnail: {
          url: u.avatarUrl + `?size=4096`
        },
        fields: [{
          name: `${icon("calendar")} Dates`,
          value: `**Account Created: **${timestamp(u.createdAt, "f")}`,
          inline: false
        }]
      })
      if(u.banner) userCard.image = { url: u.bannerUrl + `?size=4096`}

      // Guild Container
      if(m){
        userCard.fields[0].value = userCard.fields[0].value + `\n**Joined Server: **${timestamp(m.joinedAt, "f")}`
        let guildFields = []
        
        if(m.isOwner) guildFields.push(`${icon("user_king")} **Server Owner**`)
        if(m.roles.length >= 1) guildFields.push(`**Roles: ** ${m.roles.length}/${context.guild.roles.length}`)
        if(m.premiumSince) guildFields.push(`**Boosting since: ** ${timestamp(m.premiumSince, 'f')}`)
        userCard.fields.push({
          name: `${icon("home")} Server`,
          value: guildFields.join('\n'),
          inline: true
        })
      }

      // Badge Container
      let b = renderBadges(u)
      if(u.avatarUrl.endsWith('.gif') || u.banner){ b.push(BADGE_ICONS.nitro)}
      if(b.length >= 1){
        userCard.fields.push({
          name: `${icon("nitro")} Badges`,
          value: b.join(''),
          inline: true
        })
      }

      
      if(!m?.banner && m) u.member = await context.guild.fetchMember(u.id)
        
      // No special handling
      if(m == undefined || m.avatar === null && m.banner === null) return editOrReply(context, userCard)

      let pages = [];

      let memberCard = structuredClone(userCard);
      if(m?.avatar !== null) memberCard.thumbnail.url = m.avatarUrl + "?size=4096";
      if(m?.banner !== null) memberCard.image.url = `https://cdn.discordapp.com/guilds/${context.guild.id}/users/${m.id}/banners/${m.banner}.png` + "?size=4096";

      // Show the server-specific card first if available
      pages.push(page(memberCard))
      pages.push(page(userCard))
      
      await paginator.createPaginator({
        context,
        pages,
        buttons: [{
          customId: "next",
          emoji: icon("button_user_profile_swap"),
          label: "Toggle Server/Global Profile",
          style: 2
        }]
      });
    }catch(e){
      console.log(e)
    }
  },
};