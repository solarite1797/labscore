const { DISCORD_INVITES, OPEN_SOURCE_REPOSITORY_URL } = require("../../../labscore/constants");
const { createEmbed, formatPaginationEmbeds, page } = require("../../../labscore/utils/embed");
const { guildFeaturesField } = require("../../../labscore/utils/fields");
const { icon, highlight, timestamp, iconPill, iconLinkPill, link } = require("../../../labscore/utils/markdown");
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
    if(!args.invite) return editOrReply(context, {
      content: link("https://canary.discord.com/application-directory/" + context.client.user.id + " ", "⠀", "App Directory Invite", true) + " " + link(DISCORD_INVITES.invite + " ", "⠀", "labsCore Support Server", true),
      embeds: [createEmbed("default", context, {
        description: [
          "⠀",
          iconLinkPill("link", context.application.oauth2UrlFormat().replace("ptb.discordapp.com","discord.com"), 'Invite Link (Enable User Commands)', 'Discord Application Invite URL'),
          iconLinkPill("robot", DISCORD_INVITES.support, 'Support Server', 'labsCore Support Server'),
          iconLinkPill('gitlab', OPEN_SOURCE_REPOSITORY_URL, 'Source Code'),
        ].join('\n'),
        image: {
          url: STATIC_ASSETS.embed_invite_spacer
        }
      })
    ]})
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
          url: g.splashUrl + "?size=4096"
        }
      } else if(g.banner){ // if no splash exists, check the banner
        inviteCard.image = {
          url: g.bannerUrl + "?size=4096"
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