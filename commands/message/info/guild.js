const { createEmbed, page, formatPaginationEmbeds } = require("../../../labscore/utils/embed");
const { guildFeaturesField } = require("../../../labscore/utils/fields");
const { icon, highlight, timestamp, codeblock, iconPill } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");

const { paginator } = require('../../../labscore/client');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'server',
  label: 'user',
  aliases: ['guild', 'guildinfo', 'serverinfo'],
  metadata: {
    description: 'Displays information about the server.',
    description_short: 'Information about the server',
    category: 'info',
    usage: 'server'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    try{
      const emojis = context.message.guild.emojis
      const animojis = emojis.filter(emoji => emoji.animated).length
  
      const channels = context.message.guild.channels
      
      const categoryChannels = channels.filter((channel) => channel.isGuildCategory).length;
      const newsChannels = channels.filter((channel) => channel.isGuildNews).length;
      const textChannels = channels.filter((channel) => channel.isGuildText).length;
      const voiceChannels = channels.filter((channel) => channel.isGuildVoice).length;
      const stageChannels = channels.filter((channel) => channel.isGuildStageVoice).length;
      const forumChannels = channels.filter((channel) => channel.isGuildForumChannel).length;

      const g = context.guild
      // Guild Card

      // Header Pills
      let pills = []
      pills.push(iconPill("user_multiple", context.guild.memberCount))
      if(g.premiumSubscriptionCount >= 1) pills.push(iconPill("boost", g.premiumSubscriptionCount))
      if(g.roles.length >= 2) pills.push(iconPill("user_shield", `${g.roles.length} Roles`))
      pills.push(`${icon("user_king")} <@${g.owner.id}>`)
      if(emojis.length >= 1) pills.push(iconPill("emoji", emojis.length))

      let guildCard = createEmbed("default", context, {
        description: `${icon("home")} **${g.name}** ${highlight(`(${g.id})`)}\n${pills.join('   ')}\n\n${icon("calendar")} **Server created** ${timestamp(g.createdAt, "f")}`,
        fields: []
      })

      if(g.iconUrl){
        guildCard.thumbnail = {
          url: g.iconUrl + `?size=4096`
        }
      }

      // Channel Container
      let lines = [];
      if(textChannels >= 1)     lines.push(`Text Channels          ${textChannels}`)
      if(forumChannels >= 1)    lines.push(`Forum Channels         ${forumChannels}`)
      if(newsChannels >= 1)     lines.push(`Announcement Channels  ${newsChannels}`)
      if(voiceChannels >= 1)    lines.push(`Voice Channels         ${voiceChannels}`)
      if(stageChannels >= 1)    lines.push(`Stage Channels         ${stageChannels}`)
      if(categoryChannels >= 1) lines.push(`Categories             ${categoryChannels}`)

      lines.push("")
      lines.push(`Total                  ${channels.length}`)
      
      guildCard.fields.push({
        name: `${icon("channel")} Channels`,
        value: codeblock("py", lines),
        inline: true
      })

      if(g.banner){
        guildCard.image = {
          url: g.bannerUrl + "?size=4096"
        }
      } else if(g.splash){
        guildCard.image = {
          url: g.splashUrl + "?size=4096"
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

          pages.push(page(JSON.parse(JSON.stringify(Object.assign({ ...guildCard }, { fields: [...guildCard.fields, ...sub] })))))
        }

        await paginator.createPaginator({
          context,
          pages: formatPaginationEmbeds(pages)
        });
        return;
      }

      return editOrReply(context, guildCard)
    }catch(e){
      console.log(e)
    }
  },
};