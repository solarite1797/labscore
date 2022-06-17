const { COLORS } = require('../constants')

// TODO: make embed icons use the general STATICS system
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
  "defaultNoFooter": (context) => {
    return {
      color: COLORS.embed
    }
  },
  "success": (context) => {
    return {
      author: {
        name: `Success`
      },
      color: COLORS.success
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
  },
  "nsfw": (context) => {
    return {
      author: {
        iconUrl: `https://derpystuff.gitlab.io/webstorage4/v2/assets/icons/ico_nsfw_small.png`,
        name: `This command is only available in Age Restricted channels.`,
        url: `https://support.discord.com/hc/en-us/articles/115000084051-Age-Restricted-Channels-and-Content`
      },
      color: COLORS.nsfw
    }
  },
  "loading": (context) => {
    return {
      author: {
        iconUrl: `https://derpystuff.gitlab.io/webstorage4/v2/assets/icons/ico_loading_small.gif`,
        name: `Loading`
      },
      color: COLORS.embed
    }
  }
})

// Returns a formatted embed
module.exports.createEmbed = function(type, context, content){
  if(!embedTypes[type]) throw "Invalid Embed Type"
  if(!content) embedTypes[type](context)
  let emb = embedTypes[type](context)
  if(["success","warning","error","loading"].includes(type)){
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