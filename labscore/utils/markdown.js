const { ICONS } = require('../constants')

module.exports.icon = function(icon){
  if(!ICONS[icon]) return ICONS.question
  return ICONS[icon]
}

module.exports.highlight = function(content){
  return "`" + content + "`"
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
  return "  **` " + content + "  `**"
}

module.exports.smallPill = function(content){
  return "  ` " + content + " `"
}

module.exports.iconPill = function(icon, content){
  if(!ICONS[icon]) icon = "question"
  return ICONS[icon] + "  **` " + content + "  `**"
}

const SUPERSCRIPT_NUMBERS = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹"]
module.exports.citation = function(number = 1, url, tooltip = ""){
  let formatted = "";
  for(const n of number.toString().split('')) formatted += SUPERSCRIPT_NUMBERS[parseInt(n)]
  if(url){
    if(tooltip.length) tooltip = ` '${tooltip}'`
    return `[⁽${formatted}⁾](${url}${tooltip})`
  }
  return `⁽${formatted}⁾`
}