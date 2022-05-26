const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link, highlight } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { rule34 } = require('../../../labscore/api');

function createRule34Page(context, result){
  let res = {
    "embeds": [
      createEmbed("default", context, {
        description: `Rating: ${highlight(result.rating)}`,
        image: {
          url: result.fileUrl
        }
      })
    ]
  }
  if(result.thumbnail) res.embeds[0].thumbnail = { url: result.thumbnail };
  return res;
}

const SITES = {
  "rule34": "rule34.xxx",
  "e621": "e621.net",
  "danbooru": "danbooru.donmai.us",
  "gelbooru": "gelbooru.com",
  "paheal": "rule34.paheal.net",
  "xbooru": "xbooru.com",
  "safebooru": "safebooru.org"
}

module.exports = {
  name: 'rule32',
  label: 'query',
  aliases: ['r34'],
  metadata: {
    description: 'rule34 search',
    examples: ['r34 sex -site rule34'],
    category: 'search',
    usage: 'rule34 <query> [-site <service>]'
  },
  args: [
    {name: 'site', default: 'rule34'}
  ],
  run: async (context, args) => {
    context.triggerTyping();

    // very important, maybe make this a command option eventually
    if(!context.channel.nsfw){
      return editOrReply(context, {embeds:[createEmbed("nsfw", context)]})
    }

    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    if(!Object.keys(SITES).includes(args.site.toLowerCase())) return editOrReply(context, {embeds:[createEmbed("warning", context, `Invalid site type.`)]})
    try{
      let search = await rule34(context, args.query, args.site.toLowerCase())
      search = search.response
     
      let pages = []
      for(const res of search.body.data){
        pages.push(createRule34Page(context, res))
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform rule34 search.`)]})
    }
  },
};