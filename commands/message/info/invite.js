const { DISCORD_INVITES } = require("../../../labscore/constants");
const { createEmbed } = require("../../../labscore/utils/embed");
const { guildFeaturesField } = require("../../../labscore/utils/fields");
const { icon, highlight, timestamp, link } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

module.exports = {
  name: 'invite',
  label: 'invite',
  aliases: ['inviteinfo'],
  metadata: {
    description: 'Displays information about a discord invite code.',
    description_short: 'Information about discord invite links',
    examples: ['invite discord-townhall'],
    category: 'info',
    usage: 'invite <invite code>'
  },
  run: async (context, args) => { 
    context.triggerTyping();
    if(!args.invite) return editOrReply(context, { content: `https://canary.discord.com/application-directory/${context.client.user.id}`, embed:createEmbed("default", context, {
      description: `​\n${icon("link")}  You can invite the bot with ${link(context.application.oauth2UrlFormat({ scope: 'bot applications.commands', permissions: 412317247552 }), 'this link')}.\n\n${icon('robouser')} Join our ${link(DISCORD_INVITES.support, "support server")} if you need help with anything!`,
      image: {
        url: STATICS.embedSpacerInvite
      }
    })})
    try{
      const inviteCode = args.invite.match(/(?:(?:https|http):\/\/)?(?:(?:discord.gg|(?:discord|discordapp)\.com\/invite)\/)?([A-z0-z-]{2,32})/)
      const invite = await context.client.rest.fetchInvite(inviteCode[1], {withCounts: true})

      const g = invite.guild
      // Guild Card
      let inviteCard = createEmbed("default", context, {
        description: `${icon("link")} **https://discord.gg/${inviteCode[1]}**\n\n​${icon("house")} **${g.name}** ${highlight(`(${g.id})`)}\n${icon("calendar")} **Created at: **${timestamp(g.createdAt, "f")}\n\n${icon("people")}${highlight(invite.approximateMemberCount.toLocaleString())}​ ​ ​ ​ ​ ​ ${icon("online")}${highlight(invite.approximatePresenceCount.toLocaleString())}​ ​ ​ ${icon("offline")}${highlight((invite.approximateMemberCount - invite.approximatePresenceCount).toLocaleString())}`,
        thumbnail: {
          url: g.iconUrl + `?size=4096`
        },
        fields: []
      })

      // Guild Features
      if(g.features.length >= 1){
        let featureCards = guildFeaturesField(g)

        featureCards[0].name = `${icon("activity")} Guild Features`
        inviteCard.fields = inviteCard.fields.concat(featureCards)
      }

      if(g.splash){
        inviteCard.image = {
          url: `https://cdn.discordapp.com/splashes/519734247519420438/${g.splash}.png?size=4096`
        }
      }

      return editOrReply(context, inviteCard)
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, "Unable to fetch invite link."))
    }
  },
};