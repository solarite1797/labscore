const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { pill } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')

const { paginator } = require('../../../labscore/client');
const { rule34 } = require('../../../labscore/api');

function createRule34Page(context, result){
  let res = {
    "embeds": [
      createEmbed("default", context, {
        description: '',
        image: {
          url: result.fileUrl
        },
        footer: {
          text: `Rating: ${result.rating}`
        }
      })
    ]
  }
  
  // Render a few tags
  if(result.tags) {
    let tags = result.tags.splice(0, 5)
    let tagDisplay = ''
    for(const t of tags) tagDisplay += pill(t)
    res.embeds[0].description += `\n${tagDisplay}`
  }

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
  name: 'rule34',
  label: 'query',
  aliases: ['r34'],
  metadata: {
    description: 'Returns image search results from various rule34-focused sites.\n\nSupported Sites: `' + Object.keys(SITES).join(', ') + '`',
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
     
      if(search.body.data.length == 0) return editOrReply(context, {embeds:[createEmbed("warning", context, `No results found on ${SITES[args.site.toLowerCase()]}.`)]})

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