const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = Constants;

const { createEmbed, page, formatPaginationEmbeds } = require('../../../../labscore/utils/embed');

const { paginator } = require('../../../../labscore/client');
const { STATICS } = require('../../../../labscore/utils/statics');
const { bing } = require('../../../../labscore/api');
const { link, citation, codeblock } = require('../../../../labscore/utils/markdown');
const { editOrReply } = require('../../../../labscore/utils/message');



function createSearchResultPage(context, entry){
  let res;
  switch(entry.type){
    case 1: // WebPage
      res = page(createEmbed("default", context, {
        author: {
          iconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(entry.result.url)}&sz=256`,
          name: entry.result.title,
          url: entry.result.url
        },
        fields: [],
        description: `${entry.result.snippet}`,
        footer: {
          iconUrl: STATICS.bing,
          text: `Microsoft Bing • ${context.application.name}`
        }
      }))
      if(entry.result.image) res.embeds[0].thumbnail = { url: entry.result.image }
      if(entry.result.deepLinks) {
        let fl = entry.result.deepLinks;
        while(fl.length >= 1){
          fields = fl.splice(0, 4)
          fields = fields.map((f)=>link(f.url, f.title))
          res.embeds[0].fields.push({
            name: "​",
            value: fields.join('\n'),
            inline: true
          })
        }
      }
      break;
    case 2: // Entity
      res = page(createEmbed("default", context, {
        author: {
          name: entry.result.title,
          url: entry.result.url
        },
        description: `${entry.result.description}`,
        fields: [],
        footer: {
          iconUrl: STATICS.bing,
          text: `Microsoft Bing • ${context.application.name}`
        }
      }))
      if(entry.result.sources.description) res.embeds[0].description += citation(1, entry.result.sources.description.url, `Source: ${entry.result.sources.description.title}`)
      if(entry.result.image) res.embeds[0].thumbnail = { url: entry.result.image }
      if(entry.result.fields){
        // only up to 6 fields
        for(const f of entry.result.fields.splice(0, 6)){
          if(f.url){
            res.embeds[0].fields.push({
              name: f.title,
              value: f.value,
              inline: true
            })
            continue;
          }
          res.embeds[0].fields.push({
            name: f.title,
            value: f.value,
            inline: true
          })
        }
      }
      break;
    case 6: // Computation
      res = page(createEmbed("default", context, {
        author: {
          iconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent("bing.com")}&sz=256`,
          name: entry.result.expression
        },
        description: `${codeblock("python", [entry.result.value])}`,
        fields: [],
        footer: {
          iconUrl: STATICS.bing,
          text: `Microsoft Bing • ${context.application.name}`
        }
      }))
      break;
    default:
      break;
  }
   
  return res;
}



module.exports = {
  description: 'Search on Bing.',
  name: 'bing',
  options: [
    {
      name: 'query',
      description: 'Search query',
      type: ApplicationCommandOptionTypes.STRING,
      required: true
    }
  ],
  run: async (context, args) => {
    await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

    try{
      let search = await bing(context, args.query, context.channel.nsfw)
      search = search.response
     
      if(search.body.status == 2) return editOrReply(context, createEmbed("error", context, search.body.message))
      
      let pages = []
      for(const res of search.body.results){
        let sp = createSearchResultPage(context, res)
        if(sp) pages.push(sp)
      }
      
      if(!pages.length) return editOrReply(context, createEmbed("warning", context, `No results found.`))
      
      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform bing search.`))
    }
  },
};