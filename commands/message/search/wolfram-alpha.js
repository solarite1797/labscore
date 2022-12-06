const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { wolframAlpha } = require('../../../labscore/api');

function createWolframPage(context, pod){
  let res = {
    "embeds": [
      createEmbed("default", context, {
        description: `**${pod.title}**`,
        footer: {
          iconUrl: STATICS.wolframalpha,
          text: `Wolfram|Alpha • ${context.application.name}`
        }
      })
    ]
  }
  if(pod.value) res.embeds[0].description = res.embeds[0].description + `\n${pod.value}` 
  if(pod.image) res.embeds[0].image = { url: pod.image };
  return res;
}

module.exports = {
  name: 'wolframalpha',
  label: 'query',
  aliases: ['wa', 'wolfram-alpha'],
  metadata: {
    description: 'Computes a query using Wolfram|Alpha.',
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
        pages.push(createWolframPage(context, res))
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