const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { google } = require('../../../labscore/api');

function createSearchResultPage(context, result){
  let res = {
    "embeds": [
      createEmbed("default", context, {
        description: `**${link(result.url, result.title)}**\n${result.content}`,
        footer: {
          iconUrl: STATICS.google,
          text: `Google • ${context.application.name}`
        }
      })
    ]
  }
  if(result.thumbnail) res.embeds[0].thumbnail = { url: result.thumbnail };
  return res;
}

module.exports = {
  name: 'google',
  label: 'query',
  aliases: ['g', 'search'],
  metadata: {
    description: 'Returns search results from Google.',
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