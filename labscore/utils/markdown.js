const { ICONS, REDESIGN_ICONS } = require('../constants')

module.exports.icon = function(icon){
  if(!REDESIGN_ICONS[icon]) return ICONS.question
  return REDESIGN_ICONS[icon].replace(/:[a-z1-9_]*:/, ':i:')
}

module.exports.highlight = function(content){
  return "`" + content.replace(/`/g, 'ˋ') + "`"
}

module.exports.codeblock = function(type, content){
  if(!content.length) return "```" + type + "\n```"
  return "```" + type + "\n" + content.join('\n').replace(/`/g, '`​') + "\n```"
}

module.exports.link = function(url, masked, tooltip = ""){
  if(tooltip.length) tooltip = ` '${tooltip}'`
  if(masked) return `[${masked}](${url}${tooltip})`
  return url
}

module.exports.timestamp = function(time, flag = "t"){
  return `<t:${Math.floor(time/1000)}:${flag}>`
}

module.exports.pill = function(content){
  return "  **` " + content.replace(/`/g, 'ˋ') + "  `**"
}

module.exports.smallPill = function(content){
  return "  ` " + content.replace(/`/g, 'ˋ') + " `"
}

module.exports.iconPill = function(icon, content){
  if(!REDESIGN_ICONS[icon]) icon = "question"
  return REDESIGN_ICONS[icon].replace(/:[a-z1-9_]*:/, ':i:') + "  **` " + content.replace(/`/g, 'ˋ') + "  `**"
}

module.exports.smallIconPill = function(icon, content){
  if(!REDESIGN_ICONS[icon]) icon = "question"
  return REDESIGN_ICONS[icon].replace(/:[a-z1-9_]*:/, ':i:') + "  ` " + content.replace(/`/g, 'ˋ') + "  `"
}

module.exports.iconLinkPill = function(icon, url, content, tooltip = ""){
  if(!REDESIGN_ICONS[icon]) icon = "question"
  if(tooltip.length) tooltip = ` '${tooltip}'`
  if(content) return `${REDESIGN_ICONS[icon].replace(/:[a-z1-9_]*:/, ':i:')} [**\` ${content.replace(/`/g, 'ˋ')}  \`**](${url}${tooltip})`
  return url
}
module.exports.linkPill = function(url, content, tooltip = ""){
  if(tooltip.length) tooltip = ` '${tooltip}'`
  if(content) return `[**\` ${content.replace(/`/g, 'ˋ')}  \`**](${url}${tooltip})`
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