const { createEmbed, formatPaginationEmbeds, page } = require('../../../labscore/utils/embed')
const { link, citation } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { bing } = require('../../../labscore/api');

function createSearchResultPage(context, result){
  let res;
  switch(result.type){
    case 1:
      res = page(createEmbed("default", context, {
        description: `**${link(result.url, result.title)}**\n${result.snippet}`,
        footer: {
          iconUrl: STATICS.bing,
          text: `Microsoft Bing • ${context.application.name}`
        }
      }))
      break;
    case 2:
      let header = result.card.title
      if(result.card.url) header = link(result.card.url, result.card.title)
      res = page(createEmbed("default", context, {
        description: `**${header}**\n\n${result.card.description}`,
        fields: [],
        footer: {
          iconUrl: STATICS.bing,
          text: `Microsoft Bing Knowledge Graph • ${context.application.name}`
        }
      }))
      if(result.card.sources.description) res.embeds[0].description += citation(1, result.card.sources.description.url, `Source: ${result.card.sources.description.title}`)
      if(result.card.image) res.embeds[0].thumbnail = { url: result.card.image }
      if(result.card.fields){
        // only up to 6 fields
        for(const f of result.card.fields.splice(0, 6)){
          if(f.url){
            res.embeds[0].fields.push({
              name: f.title,
              value: f.value,
              inline: true
            })
            continue;
          }
          res.embeds[0].fields.push({
            name: f.title,
            value: f.value,
            inline: true
          })
        }
      }
      break;
  }
   
  if(result.image) res.embeds[0].thumbnail = { url: result.image }
  return res;
}

module.exports = {
  name: 'bing',
  label: 'query',
  aliases: ['b', 'search2'],
  metadata: {
    description: 'Returns search results from Microsoft Bing.',
    description_short: 'Bing Search',
    examples: ['bing Flask'],
    category: 'search',
    usage: 'bing <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await bing(context, args.query, context.channel.nsfw)
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
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform bing search.`)]})
    }
  },
};