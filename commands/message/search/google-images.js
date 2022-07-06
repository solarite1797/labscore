const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { googleImages } = require('../../../labscore/api');

function createImageResultPage(context, result){
  let res = {
    "embeds": [
      createEmbed("default", context, {
        description: `**${link(result.url, result.title)}**`,
        image: {
          url: result.image
        },
        footer: {
          iconUrl: STATICS.google,
          text: `Google Images • ${context.application.name}`
        }
      })
    ]
  }
  if(result.thumbnail) res.embeds[0].thumbnail = { url: result.thumbnail };
  return res;
}

module.exports = {
  name: 'image',
  label: 'query',
  aliases: ['i', 'img'],
  metadata: {
    description: 'google image search',
    examples: ['image Large Magenta Sphere'],
    category: 'search',
    usage: 'image <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await googleImages(context, args.query, context.channel.nsfw)
      search = search.response
     
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
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform google search.`)]})
    }
  },
};