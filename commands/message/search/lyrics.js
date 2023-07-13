const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { lyrics } = require('../../../labscore/api');
const { paginator } = require('../../../labscore/client');

const { Permissions } = require("detritus-client/lib/constants");

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
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await lyrics(context, args.query)
      search = search.response

      if(search.body.status == 2) return editOrReply(context, {embeds:[createEmbed("error", context, search.body.message)]})
      let fields = [];
      let lyricsText = search.body.lyrics.replace(/\[Footnote .*?\]/g,'').replace(/\[choir\]/g,'');
      if(lyricsText.includes('[')){
         // Split lyrics into field-sizes chunks if multiple verses are present
        let chunks = lyricsText.split(/\[(.*?)\]/)
        let cur = {
          inline: false
        };
        let i = 0;
        for(const c of chunks){
          if(c.length == 0) continue;
          if(i == 0){
            cur.name = `[${c.substr(0,250)}]`
            i += 1
            continue;
          }
          cur.value = c.substr(0,1000)
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
        message.description = lyricsText.substr(0, 1024)
        return editOrReply(context, message)
      }
      
      if(fields.length > 2){
        let pages = []
        while(fields.length) {
          let pageFields = fields.splice(0,2)
          
          // Display less fields if they take up too much vertical space
          while(pageFields.map((f)=>f.value).join('\n').split('\n').length >= 36 && pageFields[1]){
            fields.unshift(pageFields[pageFields.length - 1])
            pageFields = pageFields.splice(0, pageFields.length - 1)
          }
          
          pages.push({embeds:[createLyricsPage(context, search, pageFields)]})
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
      console.log(JSON.stringify(e.raw))
      return editOrReply(context, {embeds:[createEmbed("error", context, `Something went wrong.`)]})
    }
  },
};