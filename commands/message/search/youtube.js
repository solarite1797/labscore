const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { youtube } = require('../../../labscore/api');

function createYoutubePage(context, result){
  let res = {
    "embeds": [
      createEmbed("default", context, {
        description: `**${link(result.url, result.name)}**\n${result.description}`,
        thumbnail: {
          url: result.image
        },
        footer: {
          iconUrl: STATICS.youtube,
          text: `YouTube • ${context.application.name}`
        }
      })
    ]
  }
  return res;
}

module.exports = {
  name: 'youtube',
  label: 'query',
  aliases: ['yt'],
  metadata: {
    description: 'youtube search',
    examples: ['youtube Google'],
    category: 'search',
    usage: 'youtube <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await youtube(context, args.query)
      search = search.response
     
      let pages = []
      for(const res of search.body.results){
        pages.push(createYoutubePage(context, res))
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