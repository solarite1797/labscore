const { createEmbed, page, formatPaginationEmbeds } = require("../../../labscore/utils/embed");
const { guildFeaturesField } = require("../../../labscore/utils/fields");
const { icon, highlight, timestamp, codeblock } = require("../../../labscore/utils/markdown");
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
      let guildCard = createEmbed("default", context, {
        description: `${icon("home")} **${g.name}** ${highlight(`(${g.id})`)}\n\n${icon("calendar")} **Created at: **${timestamp(g.createdAt, "f")}\n${icon("user_shield")} **Roles: **${g.roles.length}\n${icon("user_multiple")} **Member Count: **${context.guild.memberCount}`,
        fields: []
      })

      if(context.guild.premiumSubscriptionCount >= 1) {
        guildCard.description += `\n${icon("boost")} **Server Boosts: **${context.guild.premiumSubscriptionCount} (Level ${context.message.guild.premiumTier})`
      }

      if(g.iconUrl){
        guildCard.thumbnail = {
          url: g.iconUrl + `?size=4096`
        }
      }

      if(g.owner) guildCard.description += `\n\n<:lc_guild_owner:674652779406426122> **Server Owner: **<@${g.owner.id}>`

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
      
      // Emoji Container
      guildCard.fields.push({
        name: `${icon("emoji")} Emoji`,
        value: codeblock("py", [
          `Regular   ${emojis.length - animojis}`,
          `Animated  ${animojis}`,
          ``,
          `Total     ${emojis.length}`,
        ]),
        inline: false
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