const { ICONS } = require('../constants')

module.exports.icon = function(icon){
  if(!ICONS[icon]) return ICONS.question.replace(/:[a-z1-9_]*:/, ':i:')
  return ICONS[icon].replace(/:[a-z1-9_]*:/, ':i:')
}

module.exports.weatherIcon = function(icon){
  if(!ICONS["weather_" + icon]) return ICONS["calendar"].replace(/:[a-z1-9_]*:/, ':i:')
  return ICONS["weather_" + icon].replace(/:[a-z1-9_]*:/, ':i:')
}

module.exports.highlight = function(content = ""){
  return "`" + content.toString().replace(/\`/g, 'ˋ') + "`"
}

module.exports.codeblock = function(type, content = ""){
  if(!content.length) return "```" + type + "\n```"
  return "```" + type + "\n" + content.join('\n').replace(/\`/g, '`​') + "\n```"
}

module.exports.link = function(url, masked, tooltip = ""){
  if(tooltip.length) tooltip = ` '${tooltip}'`
  if(masked) return `[${masked}](${url}${tooltip})`
  return url
}

module.exports.timestamp = function(time, flag = "t"){
  return `<t:${Math.floor(time/1000)}:${flag}>`
}

module.exports.stringwrap = function(content = "", length, newlines = true){
  if(!newlines) content = content.replace(/\n/, ' ')
  if(content.length > length) return content.substr(0, length) + '...';
  return content;
}

module.exports.pill = function(content = ""){
  return "  **` " + content.toString().replace(/\`/g, 'ˋ') + "  `**"
}

module.exports.smallPill = function(content = ""){
  return "  ` " + content.toString().replace(/\`/g, 'ˋ') + " `"
}

module.exports.iconPill = function(icon, content = ""){
  if(!ICONS[icon]) icon = "question"
  return ICONS[icon].replace(/:[a-z1-9_]*:/, ':i:') + "  **` " + content.toString().replace(/\`/g, 'ˋ') + "  `**"
}

module.exports.smallIconPill = function(icon, content = ""){
  if(!ICONS[icon]) icon = "question"
  return ICONS[icon].replace(/:[a-z1-9_]*:/, ':i:') + "  ` " + content.toString().replace(/\`/g, 'ˋ') + "  `"
}

module.exports.iconLinkPill = function(icon, url, content = "", tooltip = ""){
  if(!ICONS[icon]) icon = "question"
  if(tooltip.length) tooltip = ` '${tooltip}'`
  if(content) return `${ICONS[icon].replace(/:[a-z1-9_]*:/, ':i:')} [**\` ${content.toString().replace(/\`/g, 'ˋ')}  \`**](${url}${tooltip})`
  return url
}
module.exports.linkPill = function(url, content = "", tooltip = ""){
  if(tooltip.length) tooltip = ` '${tooltip}'`
  if(content) return `[**\` ${content.toString().replace(/\`/g, 'ˋ')}  \`**](${url}${tooltip})`
  return url
}

const SUPERSCRIPT_NUMBERS = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹"]
module.exports.citation = function(number = 1, url, tooltip = ""){
  let formatted = "";
  for(const n of number.toString().split('')) formatted += SUPERSCRIPT_NUMBERS[parseInt(n)]
  if(url){
    if(tooltip.length){
      if(tooltip.endsWith(' ')) tooltip = tooltip.substr(0, tooltip.length - 1)
      tooltip = ` '${tooltip.replace(/["*]/g, '')}'`
    }
    return `[⁽${formatted}⁾](${url}${tooltip})`
  }
  return `⁽${formatted}⁾`
}