const { COLORS } = require('../constants')
const { STATIC_ICONS, STATICS } = require('./statics')

const embedTypes = Object.freeze({
  "default": (context) => {
    return {
      color: COLORS.embed,
      footer: {
        iconUrl: STATICS.labscore,
        text: context.application.name
      }
    }
  },
  "image": (context) => {
    return {
      color: COLORS.embed,
      footer: {
        iconUrl: STATICS.labscore,
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
        iconUrl: STATIC_ICONS.warning,
        name: `Warning`
      },
      color: COLORS.warning
    }
  },
  "error": (context) => {
    return {
      author: {
        iconUrl: STATIC_ICONS.error,
        name: `Error`
      },
      color: COLORS.error
    }
  },
  "errordetail": (context) => {
    return {
      author: {
        iconUrl: STATIC_ICONS.error,
        name: `Error`
      },
      color: COLORS.error
    }
  },
  "nsfw": (context) => {
    return {
      author: {
        iconUrl: STATIC_ICONS.adult,
        name: `This command is only available in Age Restricted channels.`,
        url: `https://support.discord.com/hc/en-us/articles/115000084051-Age-Restricted-Channels-and-Content`
      },
      color: COLORS.nsfw
    }
  },
  "loading": (context) => {
    return {
      author: {
        iconUrl: STATIC_ICONS.loading,
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
  
  if(["errordetail"].includes(type)){
    emb.author.name = content.error
    emb.description = content.content
    return emb
  }

  if(content && content.footer && !content.footer.iconUrl) content.footer.iconUrl = STATICS.labscore
  
  if(["image"].includes(type)){
    if(content.url.includes('://')){
      emb.image = { url: content.url }
    } else {
      emb.image = { url: `attachment://${content.url}` }
    }

    if(content.provider){
      if(content.provider.text) emb.footer.text = `${content.provider.text} • ${context.application.name}`
      if(content.provider.icon) emb.footer.iconUrl = content.provider.icon
    }

    if(content.description) emb.description = content.description

    if(content.time && emb.footer) emb.footer.text = `${emb.footer.text} • Took ${content.time}s`

    return emb
  }

  return Object.assign(emb, content)
}

// Adds formatted page numbers to the embed footer
module.exports.formatPaginationEmbeds = function(embeds){
  // No formatting if we only have one page
  if(embeds.length == 1) return embeds;

  let i = 0;
  let l = embeds.length;
  let formatted = [];
  for(const e of embeds){
    i += 1;
    let ne = e;
    if(!e) continue;
    if(e.embed){
      ne.embed.footer.text = e.embed.footer.text + ` • Page ${i}/${l}`
      formatted.push(ne)
    } else if (e.embeds){
      ne.embeds = e.embeds.map((se)=>{
        se.footer.text = se.footer.text + ` • Page ${i}/${l}`
        return se;
      })

      formatted.push(ne)
    } else {
      formatted.push(e)
    }
  }
  return formatted;
}

// Creates a page for our paginator. simple helper so we dont have to do {embeds:[]} every time
module.exports.page = function(embed){
  return {
    embeds: [embed]
  }
}