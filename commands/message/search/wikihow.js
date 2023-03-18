const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { wikihow } = require('../../../labscore/api');

function createWikiHowPage(context, result){
  let e = createEmbed("default", context, {
    author: {
      name: result.title,
      url: result.link
    },
    description: result.snippet,
    footer: {
      iconUrl: STATICS.wikihow,
      text: `WikiHow • ${context.application.name}`
    }
  })
  if(result.image) e.image = {
    url: result.image
  }
  let res = {"embeds": [e]}
  return res;
}

module.exports = {
  name: 'wikihow',
  label: 'query',
  aliases: ['wh', 'how'],
  metadata: {
    description: 'Returns search results from WikiHow.',
    description_short: 'WikiHow Search',
    examples: ['wh download'],
    category: 'search',
    usage: 'wikihow <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    try{
      let search = await wikihow(context, args.query)
      search = search.response
     
      let pages = []

      if(search.body.data.length == 0) return editOrReply(context, {embeds:[createEmbed("error", context, `No results found.`)]})

      for(const res of search.body.data){
        pages.push(createWikiHowPage(context, res))
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform wikihow search.`)]})
    }
  },
};