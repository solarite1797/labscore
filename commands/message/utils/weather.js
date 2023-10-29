const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { darksky } = require('../../../labscore/api');
const { pill, iconPill, smallIconPill, smallPill, icon, weatherIcon, timestamp } = require('../../../labscore/utils/markdown');

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

      let description = `### ${weatherIcon(data.result.current.condition.id.toLowerCase())} ​ ​  ​ ​ ${Math.floor(data.result.current.temperature.current)}°C   •   ${data.result.current.condition.label}\n${data.result.location}\n\n${iconPill("thermometer", "Feels like")} ${smallPill(Math.floor(data.result.current.temperature.feels_like) + "°C")}\n${iconPill("wind", "Wind")} ${smallPill(data.result.current.wind.speed + " km/h")}`

      let secondaryPills = [];
      if(data.result.current.humidity > 0) secondaryPills.push(`${iconPill("raindrop", "Humidity")} ${smallPill(Math.floor(data.result.current.humidity * 100) + "%")}`)
      if(data.result.current.uvindex > 0) secondaryPills.push(`${iconPill("sun", "UV Index")} ${smallPill(data.result.current.uvindex)}`)

      if(secondaryPills.length >= 1) description += '\n' + secondaryPills.join(` ​ ​ ​ ​ `)
      
      description += `\n${iconPill("sun", "Sunrise")} ${timestamp(data.result.current.sun.sunrise, "t")} ​ ​ ${iconPill("moon", "Sunset")} ${timestamp(data.result.current.sun.sunset, "t")}`

      // Render Forecasts
      description += `\n`
      for(const i of data.result.forecast){
        description += `\n${pill(i.day)} ​ ​ ${weatherIcon(i.condition.toLowerCase().replace(' ', '_'))}`
        if(Math.floor(i.temperature.max).toString().length == 1) description += `${pill(Math.floor(i.temperature.max) + "°C ")}`
        else description += `${pill(Math.floor(i.temperature.max) + "°C")}`
        description += `​**/**​`
        if(Math.floor(i.temperature.min).toString().length == 1) description += `${smallPill(Math.floor(i.temperature.min) + "°C ")}`
        else description += `${smallPill(Math.floor(i.temperature.min) + "°C")}`
      }
      

      let e = createEmbed("default", context, {
        description,
        timestamp: new Date(data.result.current.date)
      })

      if(data.result.current.icon) e.thumbnail = { url: data.result.current.icon }
      if(data.result.current.image) e.image = { url: data.result.current.image }

      return editOrReply(context, {embeds: [e]})
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("warning", context, `No weather data available for given location.`)]})
    }
  },
};