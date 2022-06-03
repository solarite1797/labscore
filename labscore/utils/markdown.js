const { ICONS } = require('../constants')

module.exports.icon = function(icon){
  if(!ICONS[icon]) return ICONS.question
  return ICONS[icon]
}

module.exports.highlight = function(content){
  return "`" + content + "`"
}

module.exports.codeblock = function(type, content){
  return "```" + type + "\n" + content.join('\n') + "\n```"
}

module.exports.link = function(url, masked){
  if(masked) return `[${masked}](${url})`
  return url
}

module.exports.timestamp = function(time, flag = "t"){
  return `<t:${Math.floor(time/1000)}:${flag}>`
}