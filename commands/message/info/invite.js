const { DISCORD_INVITES, OPEN_SOURCE_REPOSITORY_URL } = require("../../../labscore/constants");
const { createEmbed, formatPaginationEmbeds, page } = require("../../../labscore/utils/embed");
const { guildFeaturesField } = require("../../../labscore/utils/fields");
const { icon, highlight, timestamp, iconPill, iconLinkPill } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATIC_ASSETS } = require("../../../labscore/utils/statics");

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
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => { 
    context.triggerTyping();
    if(!args.invite) return editOrReply(context, { content: context.application.oauth2UrlFormat({ scope: 'bot applications.commands', permissions: 412317248576 }), embed:createEmbed("default", context, {
      description: [
        '​',
        icon('brand') + ` You can invite ${context.client.user.username} with this ${iconLinkPill("link", context.application.oauth2UrlFormat({ scope: 'bot applications.commands', permissions: 412317248576 }), 'Invite Link', 'Discord Application Invite URL')}.`,
        '',
        icon('robot') + ` Need help? Join our ${iconLinkPill("discord", DISCORD_INVITES.support, 'Support Server', "Click to join")}.`,
        '',
        iconLinkPill('gitlab', OPEN_SOURCE_REPOSITORY_URL, 'Source Code'),
      ].join('\n'),
      image: {
        url: STATIC_ASSETS.embed_invite_spacer
      }
    })})
    try{
      const inviteCode = args.invite.match(/(?:(?:https|http):\/\/)?(?:(?:discord.gg|(?:discord|discordapp)\.com\/invite)\/)?([A-z0-z-]{2,32})/)
      const invite = await context.client.rest.fetchInvite(inviteCode[1], {withCounts: true})

      const g = invite.guild
      // Guild Card

      let gDesc = ""
      if(g.description) gDesc = g.description + "\n\n"
      let inviteCard = createEmbed("default", context, {
        description: `${icon("link")} **https://discord.gg/${inviteCode[1]}**\n\n​${icon("home")} **${g.name}** ${highlight(`(${g.id})`)}\n${gDesc}${icon("calendar")} **Created at: **${timestamp(g.createdAt, "f")}\n\n${iconPill("user_multiple", invite.approximateMemberCount.toLocaleString())} ​ ​ ​ ​ ​ ${iconPill("status_online", invite.approximatePresenceCount.toLocaleString())}​ ​ ​ ${iconPill("status_offline", (invite.approximateMemberCount - invite.approximatePresenceCount).toLocaleString())}`,
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
        
        if(ic == 1) featureCards[0].name = `${icon("list")} Guild Features`
        while(featureCards.length >= 1){
          i++;
          const sub = featureCards.splice(0, 2)
          sub[0].name = `${icon("list")} Guild Features (${i}/${ic})`

          pages.push(page(JSON.parse(JSON.stringify(Object.assign({ ...inviteCard }, { fields: sub })))))
        }

        await paginator.createPaginator({
          context,
          pages: formatPaginationEmbeds(pages)
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