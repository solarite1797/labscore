const { wikihow } = require('#api');
const { paginator } = require('#client');

const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed')
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics')

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

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
  return page(e);
}

module.exports = {
  name: 'wikihow',
  label: 'query',
  aliases: ['wh', 'how'],
  metadata: {
    description: 'Returns search results from WikiHow.',
    description_short: 'Search on WikiHow',
    examples: ['wh download'],
    category: 'search',
    usage: 'wikihow <query>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    try{
      let search = await wikihow(context, args.query)
      search = search.response
     
      let pages = []

      if(search.body.data.length == 0) return editOrReply(context, createEmbed("error", context, `No results found.`))

      for(const res of search.body.data){
        pages.push(createWikiHowPage(context, res))
      }
      
      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform wikihow search.`))
    }
  },
};