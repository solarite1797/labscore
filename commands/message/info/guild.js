const { createEmbed } = require("../../../labscore/utils/embed");
const { guildFeaturesField } = require("../../../labscore/utils/fields");
const { icon, highlight, timestamp, codeblock } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");

module.exports = {
  name: 'server',
  label: 'user',
  aliases: ['guild', 'guildinfo'],
  metadata: {
    description: 'Displays information about the server.',
    description_short: 'Server information',
    examples: ['guild'],
    category: 'info',
    usage: 'server'
  },
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

      const g = context.guild
      // Guild Card
      let guildCard = createEmbed("default", context, {
        description: `${icon("house")} **${g.name}** ${highlight(`(${g.id})`)}\n\n${icon("calendar")} **Created at: **${timestamp(g.createdAt, "f")}`,
        thumbnail: {
          url: g.iconUrl + `?size=4096`
        },
        fields: []
      })

      if(g.owner) guildCard.description += `\n\n<:lc_guild_owner:674652779406426122> **Server Owner: **<@${g.owner.id}>`

      // Channel Container
      guildCard.fields.push({
        name: `${icon("channel")} Channels`,
        value: codeblock("py", [
          `Text Channels          ${textChannels}`,
          `Voice Channels         ${voiceChannels}`,
          `Stage Channels         ${stageChannels}`,
          `Announcement Channels  ${newsChannels}`,
          `Categories             ${categoryChannels}`,
          ``,
          `Total                  ${channels.length}`,
        ]),
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
        inline: true
      })

      // Guild Features
      if(g.features.length >= 1){

        // Create an empty field so everything properly aligns on desktop
        guildCard.fields.push({
          name: `​`,
          value: `​`,
          inline: true
        })

        let featureCards = guildFeaturesField(g)

        featureCards[0].name = `${icon("activity")} Guild Features`
        guildCard.fields = guildCard.fields.concat(featureCards)
      }

      return editOrReply(context, guildCard)
    }catch(e){
      console.log(e)
    }
  },
};