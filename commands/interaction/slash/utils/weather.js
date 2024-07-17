const { darksky } = require('#api');
const { paginator } = require('#client');

const { createEmbed, page } = require('#utils/embed');
const { acknowledge } = require('#utils/interactions');
const { pill, iconPill, smallPill, weatherIcon, timestamp, icon, link, stringwrap} = require('#utils/markdown');
const { editOrReply } = require('#utils/message');
const { STATICS } = require('#utils/statics');

const { ApplicationCommandOptionTypes } = require('detritus-client/lib/constants');

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
      name: 'units',
      description: 'Temperature units to use.',
      type: ApplicationCommandOptionTypes.TEXT,
      choices: [
        {
          value: "celcius",
          name: "Celcius"
        },
        {
          value: "fahrenheit",
          name: "Fahrenheit"
        }
      ],
      required: false
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

      let units = ["°C", "°F"]
      if(args.units) if(["f","fahrenheit","°f"].includes(args.units.toLowerCase())) units = ["°F", "°C"]

      let pages = []
      pages.push(page(renderWeatherCard(context, data, units[0])))
      pages.push(page(renderWeatherCard(context, data, units[1])))

      await paginator.createPaginator({
        context,
        pages,
        buttons: [{
          customId: "next",
          emoji: icon("button_thermometer"),
          label: `Toggle ${unitNames[units[0]]}/${unitNames[units[1]]}`,
          style: 2
        }]
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("warning", context, `No weather data available for given location.`))
    }
  },
};