const { google } = require('#api');
const { paginator } = require('#client');

const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed')
const { link, citation } = require('#utils/markdown')
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics')

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

// TODO: create a favicon() util
function createSearchResultPage(context, result){
  let res;
  switch(result.type){
    case 1: // Search Result Entry
      res = page(createEmbed("default", context, {
          author: {
            iconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(result.url)}&sz=256`,
            name: result.title,
            url: result.url
          },
          description: result.content,
          footer: {
            iconUrl: STATICS.google,
            text: `Google • ${context.application.name}`
          }
        }))

      if(result.thumbnail) res.embeds[0].thumbnail = { url: result.thumbnail };
      break;
    case 2: // Knowledge Graph Entry
      let header = result.card.title;
      if(result.card.url) header = link(result.card.url, result.card.title)
      res = page(createEmbed("default", context, {
          description: `**${header}**\n`,
          footer: {
            iconUrl: STATICS.google,
            text: `Google Knowledge Graph • ${context.application.name}`
          }
        }))

      if(result.card.image) res.embeds[0].thumbnail = { url: result.card.image };
      if(result.card.description) res.embeds[0].description += `*${result.card.description}*\n`
      if(result.card.content){
        let cnt = result.card.content.replace(/\n/g, '')
        if(cnt.endsWith(" ")) cnt = cnt.substr(0,cnt.length - 1)
        res.embeds[0].description += "\n" + cnt + citation(1, result.card.url, "Source")
      }
      break;
    default:
      res = page(createEmbed("error", context, "Unknown GoogleResult Type: " + result.type))
      break;
  }
  return res;
}

module.exports = {
  name: 'google',
  label: 'query',
  aliases: ['g', 'search'],
  metadata: {
    description: 'Returns search results from Google.',
    description_short: 'Search on Google',
    examples: ['google Eurasian Small Clawed Otter'],
    category: 'search',
    usage: 'google <query>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (query).`))
    try{
      let search = await google(context, args.query, context.channel.nsfw)
      search = search.response
     
      if(search.body.status == 2) return editOrReply(context, createEmbed("error", context, search.body.message))

      let pages = []
      for(const res of search.body.results){
        pages.push(createSearchResultPage(context, res))
      }

      if(!pages.length) return editOrReply(context, createEmbed("warning", context, `No results found.`))
      
      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform google search.`))
    }
  },
};