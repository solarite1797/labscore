const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandTypes } = Constants;

const { createEmbed } = require('../../../labscore/utils/embed');
const { smallIconPill, highlight, smallPill, icon, timestamp } = require('../../../labscore/utils/markdown');
const { renderBadges } = require('../../../labscore/utils/users');
const { BADGE_ICONS } = require('../../../labscore/constants');
const { editOrReply } = require('../../../labscore/utils/message');
const { UserFlags } = require('detritus-client/lib/constants');

module.exports = {
  name: 'View User Details',
  type: ApplicationCommandTypes.USER,
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  run: async (context, args) => {
    try{
      await context.respond({ data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE })

      const { user, member } = args;
  
      let u = await context.client.rest.fetchUser(user.id);;
      let m = member;
  
      let botTag = ''
      if (u.bot) botTag = ""
      if (u.hasFlag(UserFlags.VERIFIED_BOT)) botTag = ""
  
      let usernameDisplay = u.name
      if (u.discriminator && u.discriminator !== "0") usernameDisplay += `#${u.discriminator}`
  
      usernameDisplay = `**@${usernameDisplay}**${botTag} ${highlight(`(${u.id})`)}`
      if (m && m.nick !== null) usernameDisplay += `\n${smallIconPill("user_card", "Nickname")} ${smallPill(m.nick)}`
  
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
      if (u.banner) userCard.image = { url: u.bannerUrl + `?size=4096` }
  
      // Guild Container
      if (m) {
        userCard.fields[0].value = userCard.fields[0].value + `\n**Joined Server: **${timestamp(m.joinedAt, "f")}`
        let guildFields = []
  
        if (m.isOwner) guildFields.push(`${icon("user_king")} **Server Owner**`)
        if(context.guild) if (m.roles.length >= 1) guildFields.push(`${icon("user_shield")} **Roles: ** ${m.roles.length}/${context.guild?.roles.length}`)
        if (m.premiumSince) guildFields.push(`**Boosting since: ** ${timestamp(m.premiumSince, 'f')}`)
        if(guildFields.length >= 1) userCard.fields.push({
          name: `${icon("home")} Server`,
          value: guildFields.join('\n'),
          inline: true
        })
      }
  
      // Badge Container
      let b = renderBadges(u)
      if (u.avatarUrl.endsWith('.gif') || u.banner) { b.push(BADGE_ICONS.nitro) }
      if (b.length >= 1) {
        userCard.fields.push({
          name: `${icon("nitro")} Badges`,
          value: b.join(''),
          inline: true
        })
      }
      return editOrReply(context, userCard)
    }catch(e){
      console.log(e)
    }
  },
};