const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { lyrics } = require('../../../labscore/api');
const { paginator } = require('../../../labscore/client');

const reactions = {
    previousPage: "⬅️",
    nextPage: "➡️"
};

function createLyricsPage(context, search, fields){
  let em= createEmbed("default", context, {
    description: `**${search.body.song.title}**\n*Released ${search.body.song.release}*\n\n`,
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

      // Split lyrics into field-sizes chunks
      let chunks = search.body.lyrics.split(/\[(.*?)\]/) // should give us every chunk
      let fields = [];
      let cur = {
        inline: false
      };
      let i = 0;
      let l = 0;
      for(const c of chunks){
        if(c.length == 0) continue;
        if(i == 0){
          cur.name = `[${c}]`
          i += 1
          continue;
        }
        cur.value = c.substr(0,1024) + `​`
        i = 0
        fields.push(cur)
        cur = {
          inline: false
        }
      }
      
      if(fields.length > 3){
        let pages = []
        while(fields.length) {
          pages.push({embeds:[createLyricsPage(context, search, fields.splice(0,3))]})
        }
        const message = context.message

        pages = formatPaginationEmbeds(pages)
        const paging = await paginator.createReactionPaginator({
          message,
          pages,
          reactions
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