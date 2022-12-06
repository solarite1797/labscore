const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')
const { getRecentImage } = require("../../../labscore/utils/attachment");

const { paginator } = require('../../../labscore/client');
const { tineye } = require('../../../labscore/api');

function createTineyeResultPage(context, result){
  let res = {
    "embeds": [
      createEmbed("default", context, {
        description: `**${link(result.url, result.name)}**\nLast indexed: ${result.date}`,
        image: {
          url: result.image
        },
        thumbnail: {
          url: result.cached
        },
        footer: {
          iconUrl: STATICS.tineye,
          text: `TinEye • ${context.application.name}`
        }
      })
    ]
  }
  if(result.thumbnail) res.embeds[0].thumbnail = { url: result.thumbnail };
  return res;
}

module.exports = {
  name: 'reverse-image',
  aliases: ['reverse', 'tineye','reverseimage'],
  metadata: {
    description: 'Performs a reverse-image-search.',
    examples: ['reverseimage'],
    category: 'search',
    usage: 'reverse <image>'
  },
  run: async (context) => {
    context.triggerTyping();
    try{
      let image = await getRecentImage(context, 50)
      if(!image) return editOrReply(context, { embeds: [createEmbed("warning", context, "No images found.")] })

      let search = await tineye(context, image)
      search = search.response
     
      if(search.body.status == 2) return editOrReply(context, {embeds:[createEmbed("error", context, search.body.message)]})

      let pages = []
      for(const res of search.body.results){
        pages.push(createTineyeResultPage(context, res))
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform reverse image search.`)]})
    }
  },
};