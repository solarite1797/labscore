const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { darksky } = require('../../../labscore/api');
const { pill, iconPill, smallIconPill, smallPill, icon } = require('../../../labscore/utils/markdown');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'weather',
  aliases: ['forecast'],
  label: 'query',
  metadata: {
    description: 'Displays information about the weather.',
    description_short: 'Local weather information',
    examples: ['weather Otter, Germany'],
    category: 'utils',
    usage: 'weather <location>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (location).`)]})
    try{
      let data = await darksky(context, args.query)

      data = data.response.body

      let description = `### ${data.result.location} • ${data.result.current.condition}\n${iconPill("thermometer", data.result.current.temperature.current + "°C")} ​ ​ ​ ​ ${pill("Wind")} ${smallPill(data.result.current.wind.speed + " km/h")}`

      let secondaryPills = [];
      if(data.result.current.humidity > 0) secondaryPills.push(`${pill("Humidity")} ${smallPill(data.result.current.humidity)}`)
      if(data.result.current.uvindex > 0) secondaryPills.push(`${pill("UV Index")} ${smallPill(data.result.current.uvindex)}`)

      if(secondaryPills.length >= 1) description += '\n' + secondaryPills.join(` ​ ​ ​ ​ `)
      
      // Render Forecasts
      description += `\n`
      for(const i of data.result.forecast){
        description += `\n${pill(i.day)} ​ ​ ${smallPill(i.condition)} ${icon("thermometer")} Between ${smallPill(i.temperature.min + "°C")} and ${smallPill(i.temperature.max + "°C")} `
      }
      

      let e = createEmbed("default", context, {
        description,
        thumbnail: {
          url: data.result.current.icon
        },
        timestamp: new Date(data.result.current.date)
      })

      return editOrReply(context, {embeds: [e]})
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("warning", context, `No weather data available for given location.`)]})
    }
  },
};