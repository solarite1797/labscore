const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { bing } = require('../../../labscore/api');

function createSearchResultPage(context, result){
  let res = {
    "embeds": [
      createEmbed("default", context, {
        description: `**${link(result.url, result.title)}**\n${result.snippet}`,
        footer: {
          iconUrl: STATICS.bing,
          text: `Microsoft Bing • ${context.application.name}`
        }
      })
    ]
  }
  return res;
}

module.exports = {
  name: 'bing',
  label: 'query',
  aliases: ['b', 'search2'],
  metadata: {
    description: 'bing search',
    examples: ['bing Flask'],
    category: 'search',
    usage: 'bing <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await bing(context, args.query)
      search = search.response
     
      let pages = []
      for(const res of search.body.results){
        pages.push(createSearchResultPage(context, res))
      }
      
      pages = formatPaginationEmbeds(pages)
      const message = context.message
      const paging = await paginator.createPaginator({
        message,
        pages
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform google search.`)]})
    }
  },
};