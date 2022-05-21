const { COLORS } = require('../constants')

const embedTypes = Object.freeze({
  "default": (context) => {
    return {
      color: COLORS.embed,
      footer: {
        iconUrl: `https://cdn.discordapp.com/avatars/${context.application.id}/${context.application.icon}.png?size=256`,
        text: context.application.name
      }
    }
  },
  "warning": (context) => {
    return {
      author: {
        iconUrl: `https://derpystuff.gitlab.io/webstorage4/v2/assets/icons/ico_warning_small.png`,
        name: `Warning`
      },
      color: COLORS.warning
    }
  },
  "error": (context) => {
    return {
      author: {
        iconUrl: `https://derpystuff.gitlab.io/webstorage4/v2/assets/icons/ico_error_small.png`,
        name: `Error`
      },
      color: COLORS.error
    }
  }
})

// Returns a formatted embed
module.exports.createEmbed = function(type, context, content){
  if(!embedTypes[type]) throw "Invalid Embed Type"
  if(!content) embedTypes[type](context)
  let emb = embedTypes[type](context)
  if(["warning","error"].includes(type)){
    emb.author.name = content
    return emb
  }
  return Object.assign(emb, content)
}

// Adds formatted page numbers to the embed footer
module.exports.formatPaginationEmbeds = function(embeds){
  let i = 0;
  let l = embeds.length;
  let formatted = [];
  for(const e of embeds){
    i += 1;
    let ne = e;
    if(e.embed){
      ne.embed.footer.text = e.embed.footer.text + ` • Page ${i}/${l}`
      formatted.push(ne)
    } else if (e.embeds){
      let fse = []
      for(const se of e.embeds){
        se.footer.text = se.footer.text + ` • Page ${i}/${l}`
        fse.push(se)
      }
      ne.embeds = fse
      formatted.push(ne)
    } else {
      formatted.push(e)
    }
  }
  return formatted;
}