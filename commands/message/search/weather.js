const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { weather } = require('../../../labscore/api');
const { pill, icon } = require('../../../labscore/utils/markdown');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'weather',
  aliases: ['forecast'],
  label: 'query',
  metadata: {
    description: 'Displays information about the weather.',
    description_short: 'Local weather information',
    examples: ['weather Otter, Germany'],
    category: 'search',
    usage: 'weather <location>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (location).`)]})
    try{
      let data = await weather(context, args.query)

      data = data.response.body

      let e = createEmbed("default", context, {
        description: `**${data.name}**   ${pill(data.temperature.celcius.main)}  ${pill(data.temperature.fahrenheit.main)}\n*${data.display.name}, ${data.display.description}*`,
        fields: [{
          name: `${icon("upvote")}  Maximum Temperature`,
          value: `${pill(data.temperature.celcius.max)}  ${pill(data.temperature.fahrenheit.max)}\n\n${icon("downvote")}  **Minimum Temperature**\n${pill(data.temperature.celcius.min)}  ${pill(data.temperature.fahrenheit.min)}`,
          inline: true
        },{
          name: `Humidity`,
          value: `${pill(data.misc.humidity)}\n\n**Felt Temperature**\n${pill(data.temperature.celcius.feels_like)}  ${pill(data.temperature.fahrenheit.feels_like)}`,
          inline: true
        },{
          name: `Wind Speed`,
          value: `${pill(data.wind.speed)}\n\n**Wind Direction**\n${pill(data.wind.degree + '°')}`,
          inline: false
        }],
        thumbnail: {
          url: data.display.icon
        },
        footer: {
          iconUrl: STATICS.openweathermap,
          text: `OpenWeatherMap • ${context.application.name}`
        }
      })

      return editOrReply(context, {embeds: [e]})
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("warning", context, `No weather data available for given location.`)]})
    }
  },
};