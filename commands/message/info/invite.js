const { GUILD_FEATURES } = require("../../../labscore/constants");
const { createEmbed } = require("../../../labscore/utils/embed");
const { icon, highlight, timestamp, codeblock } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");

module.exports = {
  name: 'invite',
  label: 'invite',
  aliases: ['inviteinfo'],
  metadata: {
    description: 'invite info',
    examples: ['invite discord-townhall'],
    category: 'info',
    usage: 'invite <invite code>'
  },
  run: async (context, args) => { 
    context.triggerTyping();
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
        guildFeatures = g.features.sort((a, b) => a.normalize().localeCompare(b.normalize()));

        let featureCards = []
        while(guildFeatures.length){
          ff = guildFeatures.splice(0, 10)
          let f = [];
          for(const feat of ff){
            if(GUILD_FEATURES[feat]){
              f.push(GUILD_FEATURES[feat])
            } else {
              f.push(`<:UNKNOWN:878298902971965520> ${feat}`)
            }
          }
          featureCards.push({
            name: `​`,
            value: f.join('\n'),
            inline: true
          })
        }

        featureCards[0].name = `${icon("activity")} Guild Features`
        inviteCard.fields = inviteCard.fields.concat(featureCards)
      }

      return editOrReply(context, { embeds: [inviteCard] })
    }catch(e){
      console.log(e)
    }
  },
};