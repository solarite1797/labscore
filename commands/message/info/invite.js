const { DISCORD_INVITES } = require("../../../labscore/constants");
const { createEmbed, formatPaginationEmbeds, page } = require("../../../labscore/utils/embed");
const { guildFeaturesField } = require("../../../labscore/utils/fields");
const { icon, highlight, timestamp, link } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

const { paginator } = require('../../../labscore/client');

const { Permissions } = require("detritus-client/lib/constants");

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
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS],
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
        fields: []
      })

      if(g.iconUrl){
        inviteCard.thumbnail = {
          url: g.iconUrl + `?size=4096`
        }
      }

      if(g.splash){
        inviteCard.image = {
          url: `https://cdn.discordapp.com/splashes/${g.id}/${g.splash}.png?size=4096`
        }
      }

      // Guild Features
      if(g.features.length >= 1){
        let featureCards = guildFeaturesField(g)
                
        let pages = [];
        let i = 0;
        let ic = Math.ceil(featureCards.length / 2);
        
        if(ic == 1) featureCards[0].name = `${icon("activity")} Guild Features`
        while(featureCards.length >= 1){
          i++;
          const sub = featureCards.splice(0, 2)
          sub[0].name = `${icon("activity")} Guild Features (${i}/${ic})`

          pages.push(page(JSON.parse(JSON.stringify(Object.assign({ ...inviteCard }, { fields: sub })))))
        }

        pages = formatPaginationEmbeds(pages)
        const paging = await paginator.createPaginator({
          context,
          pages
        });
        return;
      }

      return editOrReply(context, inviteCard)
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, "Unable to fetch invite link."))
    }
  },
};