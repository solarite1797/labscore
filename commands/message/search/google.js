const { createEmbed, formatPaginationEmbeds, page } = require('../../../labscore/utils/embed')
const { link, pill, citation } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { google } = require('../../../labscore/api');

function createSearchResultPage(context, result){
  let res;
  switch(result.type){
    case 1: // Search Result Entry
      res = page(createEmbed("default", context, {
          description: `**${link(result.url, result.title)}**\n${result.content}`,
          footer: {
            iconUrl: STATICS.google,
            text: `Google • ${context.application.name}`
          }
        }))
      if(result.thumbnail) res.embeds[0].thumbnail = { url: result.thumbnail };
      return res;
      break;
    case 2: // Knowledge Graph Entry
      let header = result.card.title;
      if(result.card.url) header = link(result.card.url, result.card.title)
      res = page(createEmbed("default", context, {
          description: `**${header}**\n*${result.card.description}*\n\n`,
          footer: {
            iconUrl: STATICS.google,
            text: `Google Knowledge Graph • ${context.application.name}`
          }
        }))
      if(result.card.image) res.embeds[0].thumbnail = { url: result.card.image };
      if(result.card.content) res.embeds[0].description += result.card.content.replace(/\n/g, '') + citation(1, result.card.url, "Source")
      return res;
      break;
    default:
      res = page(createEmbed("error", context, "Unknown GoogleResult Type: " + result.type))
      return res;
      break;
  }
}

module.exports = {
  name: 'google',
  label: 'query',
  aliases: ['g', 'search'],
  metadata: {
    description: 'Returns search results from Google.',
    description_short: 'Google Search',
    examples: ['google Flask'],
    category: 'search',
    usage: 'google <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await google(context, args.query, context.channel.nsfw)
      search = search.response
     
      if(search.body.status == 2) return editOrReply(context, {embeds:[createEmbed("error", context, search.body.message)]})

      let pages = []
      for(const res of search.body.results){
        pages.push(createSearchResultPage(context, res))
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform google search.`)]})
    }
  },
};