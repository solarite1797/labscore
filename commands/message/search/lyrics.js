const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { lyrics } = require('../../../labscore/api');
const { paginator } = require('../../../labscore/client');

function createLyricsPage(context, search, fields){
  let em = createEmbed("default", context, {
    author: {
      iconUrl: search.body.artist.image,
      name: search.body.song.title,
      url: search.body.song.url
    },
    fields: fields,
    footer: {
      iconUrl: STATICS.genius,
      text: `Genius • ${context.application.name}`
    }
  }) 
  if(search.body.song.image) em.thumbnail = { url: search.body.song.image }
  return em;
}

module.exports = {
  name: 'lyrics',
  label: 'query',
  metadata: {
    description: 'Searches for song lyrics on Genius.',
    description_short: 'Search song lyrics',
    examples: ['lyrics desert bloom man'],
    category: 'search',
    usage: 'lyrics <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await lyrics(context, args.query)
      search = search.response

      if(search.body.status == 2) return editOrReply(context, {embeds:[createEmbed("error", context, search.body.message)]})
      let fields = [];
      if(search.body.lyrics.includes('[')){
         // Split lyrics into field-sizes chunks if multiple verses are present
        let chunks = search.body.lyrics.split(/\[(.*?)\]/)
        let cur = {
          inline: false
        };
        let i = 0;
        for(const c of chunks){
          if(c.length == 0) continue;
          if(i == 0){
            cur.name = `[${c}]`
            i += 1
            continue;
          }
          cur.value = c.substr(0,1024)
          if(cur.value.endsWith('\n\n')) cur.value = cur.value.substr(0,cur.value.length-1)
          cur.value += `​`
          i = 0
          fields.push(cur)
          cur = {
            inline: false
          }
        }
      } else {
        let message = createLyricsPage(context, search, [])
        message.description = search.body.lyrics.substr(0, 2048)
        return editOrReply(context, message)
      }
      
      if(fields.length > 3){
        let pages = []
        while(fields.length) {
          pages.push({embeds:[createLyricsPage(context, search, fields.splice(0,3))]})
        }
        
        pages = formatPaginationEmbeds(pages)
        const paging = await paginator.createPaginator({
          context,
          pages
        });
        return;
      }

      return editOrReply(context, {embeds: [createLyricsPage(context, search, fields)]})
      
    }catch(e){
      if(e.response?.body?.status){
        if(e.response.body.status == 2){
          return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform lyrics search.`)]})
        }
      }
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Something went wrong.`)]})
    }
  },
};