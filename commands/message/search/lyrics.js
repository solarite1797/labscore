const { lyrics } = require('#api');
const { paginator } = require('#client');

const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed')
const { smallIconPill } = require('#utils/markdown');
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics')

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

const META_FIELDS = {
  "Album": "stat_videos",
  "Released": "note"
}

function renderMetadata(metadata){
  const pills = []
  for(const m of metadata){
    if(!META_FIELDS[m.id]) continue;
    pills.push(smallIconPill(META_FIELDS[m.id], `${m.id}: ${m.value}`))
  }
  return pills.join('  ')
}

function createLyricsPage(context, search, fields){
  let em = createEmbed("default", context, {
    author: {
      iconUrl: search.body.track.artist_cover,
      name: `${search.body.track.title} by ${search.body.track.artist}`
    },
    fields: fields,
    footer: {
      iconUrl: STATICS.musixmatch,
      text: `Musixmatch • ${context.application.name}`
    }
  }) 
  if(search.body.track.cover) em.thumbnail = { url: search.body.track.cover }
  if(search.body.track.metadata.length) em.description = renderMetadata(search.body.track.metadata)
  return em;
}

module.exports = {
  name: 'lyrics',
  label: 'query',
  metadata: {
    description: 'Searches for song lyrics.',
    description_short: 'Search song lyrics',
    examples: ['lyrics desert bloom man'],
    category: 'search',
    usage: 'lyrics <query>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (query).`))
    try{
      let search = await lyrics(context, args.query)
      search = search.response

      if(search.body.status == 2) return editOrReply(context, createEmbed("error", context, search.body.message))
      let fields = [];
      
      for(const f of search.body.lyrics.split('\n\n')){
        fields.push({
          name: '​',
          value: f,
          inline: false
        })
      }

      let pages = []
      while(fields.length) {
        let pageFields = fields.splice(0,3)
        
        // Display less fields if they take up too much vertical space
        while(pageFields.map((f)=>f.value).join('\n').split('\n').length >= 30 && pageFields[1]){
          fields.unshift(pageFields[pageFields.length - 1])
          pageFields = pageFields.splice(0, pageFields.length - 1)
        }
        
        pages.push(page(createLyricsPage(context, search, pageFields)))
      }
      
      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    }catch(e){
      if(e.response?.body?.status && e.response.body.status == 2 && e.response.body.message) return editOrReply(context, createEmbed("error", context, e.response.body.message))
      console.log(JSON.stringify(e.raw))
      return editOrReply(context, createEmbed("error", context, `Something went wrong.`))
    }
  },
};