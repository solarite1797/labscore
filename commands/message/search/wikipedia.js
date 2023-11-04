
const { createEmbed, formatPaginationEmbeds, page } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const superagent = require('superagent')

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'wikipedia',
  label: 'query',
  aliases: ['wiki'],
  metadata: {
    description: 'Returns search results from Wikipedia.',
    description_short: 'Search on Wikipedia',
    examples: ['wiki otters'],
    category: 'search',
    usage: 'wikipedia <query>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    try{
      let search = await superagent.get(`https://api.wikimedia.org/core/v1/wikipedia/en/search/page`)
        .query({
          q: args.query,
          limit: 100,
          language: 'en'
        })

      let pages = []

      if(!search.body.pages.length) return editOrReply(context, createEmbed("error", context, `No results found.`))

      for(const res of Object.values(search.body.pages)){
        let p = createEmbed("default", context, {
          author: {
            name: res.title,
            url: `https://en.wikipedia.org/wiki/${res.key}`
          },
          footer: {
            iconUrl: STATICS.wikipedia,
            text: `Wikipedia • ${context.application.name}`
          }
        })

        if(res.thumbnail && res.thumbnail.url) p.thumbnail = {
          url: 'https:' + res.thumbnail.url.replace(/d3\/.*?\/[0-9]*px-/, '/d3/').replace('/thumb/d/', '/d')
        }
        
        if(res.excerpt) p.description = res.excerpt.replace(/\<.*?\>/g, '')

        pages.push(page(p))
      }
      
      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform wikipedia search.`))
    }
  },
};