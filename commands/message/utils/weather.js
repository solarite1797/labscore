const { darksky } = require('#api');
const { paginator } = require('#client');

const { createEmbed, page } = require('#utils/embed')
const { pill, iconPill, smallPill, weatherIcon, timestamp, icon, link, stringwrap} = require('#utils/markdown');
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics');

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

const modifiers = {
  "°C": (i)=>i,
  "°F": (i)=>(i*(9/5))+32
}

const unitNames = {
  "°C": "Celcius",
  "°F": "Fahrenheit"
}

function temperature(value, units){
  return `${Math.floor(modifiers[units](value))}${units}`
}

function renderWeatherCard(context, data, units){
  let description = `### ${weatherIcon(data.result.current.icon.id)} ​ ​  ​ ​ ${temperature(data.result.current.temperature.current, units)}   •   ${data.result.current.condition.label}\n\n${pill("Feels like")} ${smallPill(temperature(data.result.current.temperature.feels_like, units))} ​ ​ ​ ​ ${pill("Wind")} ${smallPill(data.result.current.wind.speed + " km/h")}`

  let secondaryPills = [];
  if(data.result.current.humidity > 0) secondaryPills.push(`${pill("Humidity")} ${smallPill(Math.floor(data.result.current.humidity * 100) + "%")}`)
  if(data.result.current.uvindex > 0) secondaryPills.push(`${pill("UV Index")} ${smallPill(data.result.current.uvindex)}`)

  if(secondaryPills.length >= 1) description += '\n' + secondaryPills.join(` ​ ​ ​ ​ `)
  
  description += `\n\n${iconPill("sun", "Sunrise")} ${timestamp(data.result.current.sun.sunrise, "t")} ​ ​ ${iconPill("moon", "Sunset")} ${timestamp(data.result.current.sun.sunset, "t")}`

  // Render weather alerts
  if(data.result.warnings.length >= 1){
    for(const w of data.result.warnings.splice(0, 1)){
      if(description.includes(stringwrap(w.label, 50))) continue;
      description += `\n\n${icon("warning")} **${stringwrap(w.label, 50)}**\n-# ${stringwrap(w.source, 50)} • ${link(w.url, "Learn More", "Learn more about this alert")}`
    }
  }

  // Render Forecasts
  description += `\n`

  let space = 3;
  if(units === "°F") space = 4;
  for(const i of data.result.forecast){
    description += `\n${pill(i.day)} ​ ​ ${weatherIcon(i.icon)}`
    if(temperature(i.temperature.max, units).toString().length === space) description += `${pill(temperature(i.temperature.max, units) + " ")}`
    else description += `${pill(temperature(i.temperature.max, units))}`
    description += `​**/**​`
    if(temperature(i.temperature.min, units).toString().length === space) description += `${smallPill(temperature(i.temperature.min, units) + " ")}`
    else description += `${smallPill(temperature(i.temperature.min, units))}`
  }
  
  
  let e = createEmbed("default", context, {
    description,
    timestamp: new Date(data.result.current.date)
  })

  e.footer.iconUrl = STATICS.weather
  if(data.result.location) e.footer.text = data.result.location

  if(data.result.current.icon) e.thumbnail = { url: data.result.current.icon.url }
  if(data.result.current.image) e.image = { url: data.result.current.image }


  return e;
}

module.exports = {
  name: 'weather',
  aliases: ['forecast'],
  label: 'query',
  metadata: {
    description: 'Displays information about the weather.',
    description_short: 'Local weather information',
    examples: ['weather Otter, Germany -t f'],
    category: 'utils',
    usage: 'weather <location> [-t <c|f>',
    slashCommand: "weather"
  },
  args: [
    {name: 't', default: 'celcius', type: 'units', help: "Temperature Units to use."},
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (location).`))
    try{
      let data = await darksky(context, args.query)

      data = data.response.body

      let units = ["°C", "°F"]
      if(["f","fahrenheit","°f"].includes(args.t.toLowerCase())) units = ["°F", "°C"]

      let pages = []
      pages.push(page(renderWeatherCard(context, data, units[0])))
      pages.push(page(renderWeatherCard(context, data, units[1])))

      await paginator.createPaginator({
        context,
        pages,
        buttons: [{
          customId: "next",
          emoji: "<:ico_button_thermometer:1262512806633144382>",
          label: `Toggle ${unitNames[units[0]]}/${unitNames[units[1]]}`,
          style: 2
        }]
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("warning", context, `No weather data available for given location.`))
    }
  }
};