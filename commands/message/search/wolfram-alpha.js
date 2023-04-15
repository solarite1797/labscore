const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { wolframAlpha } = require('../../../labscore/api');
const { citation } = require('../../../labscore/utils/markdown');

function getWolframSource(ref, sources){
  for(const s of Object.values(sources)){
    if(s.ref == ref) return s
  }
}

function createWolframPage(context, pod, query, sources){
  let res = {
    "embeds": [
      createEmbed("default", context, {
        author: {
          name: pod.title,
          url: `https://www.wolframalpha.com/input?i=${encodeURIComponent(query)}`
        },
        description: undefined,
        footer: {
          iconUrl: STATICS.wolframalpha,
          text: `Wolfram|Alpha • ${context.application.name}`
        }
      })
    ]
  }
  if(pod.icon) res.embeds[0].author.iconUrl = pod.icon
  if(pod.value) res.embeds[0].description = pod.value
  if(pod.value && pod.refs) {
    for(const r of pod.refs){
      let src = getWolframSource(r, sources)
      if(src.url) res.embeds[0].description += citation(r, src.url, src.title)
    }
  }
  if(pod.image) res.embeds[0].image = { url: pod.image };
  return res;
}

module.exports = {
  name: 'wolframalpha',
  label: 'query',
  aliases: ['wa', 'wolfram-alpha'],
  metadata: {
    description: 'Computes a query using Wolfram|Alpha.',
    description_short: 'Compute Wolfram|Alpha queries',
    examples: ['wa 1+1'],
    category: 'search',
    usage: 'wolframalpha <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await wolframAlpha(context, args.query)
      search = search.response
     
      if(search.body.status == 1) return editOrReply(context, {embeds:[createEmbed("warning", context, search.body.message)]})

      let pages = []
      for(const res of search.body.data){
        pages.push(createWolframPage(context, res, args.query, search.body.sources))
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform Wolfram|Alpha search.`)]})
    }
  },
};