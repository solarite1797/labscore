const { darksky } = require('#api');

const { createEmbed } = require('#utils/embed');
const { acknowledge } = require('#utils/interactions');
const { pill, iconPill, smallPill, weatherIcon, timestamp } = require('#utils/markdown');
const { editOrReply } = require('#utils/message');
const { STATICS } = require('#utils/statics');

const { ApplicationCommandOptionTypes } = require('detritus-client/lib/constants');

module.exports = {
  name: 'weather',
  description: 'Check the weather at a location.',
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  options: [
    {
      name: 'location',
      description: 'City or place to check.',
      type: ApplicationCommandOptionTypes.TEXT,
      required: true
    },
    {
      name: 'incognito',
      description: 'Makes the response only visible to you.',
      type: ApplicationCommandOptionTypes.BOOLEAN,
      required: false,
      default: false
    }
  ],
  run: async (context, args) => {
    await acknowledge(context, args.incognito);

    try{
      let data = await darksky(context, args.location)

      data = data.response.body

      let description = `### ${weatherIcon(data.result.current.icon.id)} ​ ​  ​ ​ ${Math.floor(data.result.current.temperature.current)}°C   •   ${data.result.current.condition.label}\n\n${pill("Feels like")} ${smallPill(Math.floor(data.result.current.temperature.feels_like) + "°C")} ​ ​ ​ ​ ${pill("Wind")} ${smallPill(data.result.current.wind.speed + " km/h")}`

      let secondaryPills = [];
      if(data.result.current.humidity > 0) secondaryPills.push(`${pill("Humidity")} ${smallPill(Math.floor(data.result.current.humidity * 100) + "%")}`)
      if(data.result.current.uvindex > 0) secondaryPills.push(`${pill("UV Index")} ${smallPill(data.result.current.uvindex)}`)

      if(secondaryPills.length >= 1) description += '\n' + secondaryPills.join(` ​ ​ ​ ​ `)
      
      description += `\n\n${iconPill("sun", "Sunrise")} ${timestamp(data.result.current.sun.sunrise, "t")} ​ ​ ${iconPill("moon", "Sunset")} ${timestamp(data.result.current.sun.sunset, "t")}`

      // Render Forecasts
      description += `\n`
      for(const i of data.result.forecast){
        description += `\n${pill(i.day)} ​ ​ ${weatherIcon(i.icon)}`
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

      e.footer.iconUrl = STATICS.weather
      if(data.result.location) e.footer.text = data.result.location //+ " • " + context.client.user.username

      if(data.result.current.icon) e.thumbnail = { url: data.result.current.icon.url }
      if(data.result.current.image) e.image = { url: data.result.current.image }

      return editOrReply(context, e)
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("warning", context, `No weather data available for given location.`))
    }
  },
};