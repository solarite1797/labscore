const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { bingImages } = require('../../../labscore/api');

function createImageResultPage(context, result){
  let res = {
    "embeds": [
      createEmbed("default", context, {
        author: {
          iconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(result.url)}&sz=256`,
          name: result.title,
          url: result.url
        },
        image: {
          url: result.image
        },
        footer: {
          iconUrl: STATICS.bing,
          text: `Microsoft Bing • ${context.application.name}`
        }
      })
    ]
  }
  if(result.thumbnail) res.embeds[0].thumbnail = { url: result.thumbnail };
  return res;
}

module.exports = {
  name: 'bingimage',
  label: 'query',
  aliases: ['bi', 'bimg', 'img2'],
  metadata: {
    description: 'Returns image search results from Microsoft Bing.',
    description_short: 'Bing Image Search',
    examples: ['bing Large Magenta Sphere'],
    category: 'search',
    usage: 'bing <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await bingImages(context, args.query, context.channel.nsfw)
      search = search.response
      
      if(search.body.status == 2) return editOrReply(context, {embeds:[createEmbed("error", context, search.body.message)]})
     
      let pages = []
      for(const res of search.body.results){
        pages.push(createImageResultPage(context, res))
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