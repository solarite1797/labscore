const { createEmbed } = require("../../../labscore/utils/embed");
const { icon, highlight, timestamp } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { getUser, renderBadges } = require("../../../labscore/utils/users");

const { Constants } = require('detritus-client')
const { UserFlags } = Constants

module.exports = {
  name: 'user',
  label: 'user',
  aliases: ['u', 'profile'],
  metadata: {
    description: 'Displays information about a discord user. Accepts IDs, Mentions and Usernames.',
    description_short: 'User information',
    examples: ['user labsCore'],
    category: 'info',
    usage: 'user [<user>]'
  },
  run: async (context, args) => { 
    context.triggerTyping();
    try{
      let u;
      if(!args.user) { args.user = context.user.id }
      user = await getUser(context, args.user)
      u = user.user
      if(!u) return editOrReply(context, { embeds: [createEmbed("warning", context, "No users found.")] })
      let m = user.member
      
      // User Card

      // TODO: create bot tag emoji for this
      let botTag = ''
      if(u.bot) botTag = ""
      if(u.hasFlag(UserFlags.VERIFIED_BOT)) botTag = ""

      let userCard = createEmbed("default", context, {
        description: `${icon("person")} **${u.name}#${u.discriminator}**${botTag} ${highlight(`(${u.id})`)}`,
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
        userCard.fields[0].value = userCard.fields[0].value + `\n**Joined Guild: **${timestamp(m.joinedAt, "f")}`
        let guildFields = []
        
        if(m.isOwner) guildFields.push(`**Server Owner** <:lc_guild_owner:674652779406426122>`)
        if(m.roles.length >= 1) guildFields.push(`**Roles: ** ${m.roles.length}/${context.guild.roles.length}`)
        if(m.premiumSince) guildFields.push(`**Boosting since: ** ${timestamp(m.premiumSince, 'f')}`)
        userCard.fields.push({
          name: `${icon("house")} Server`,
          value: guildFields.join('\n'),
          inline: true
        })
      }

      // Badge Container
      let b = renderBadges(u)
      if(u.avatarUrl.endsWith('.gif') || u.banner){ b.push('<:badge_nitro:917012997463998485>' )}
      if(b.length >= 1){
        userCard.fields.push({
          name: `${icon("nitro")} Badges`,
          value: b.join(''),
          inline: true
        })
      }
      return editOrReply(context, { embeds: [userCard] })
    }catch(e){
      console.log(e)
    }
  },
};