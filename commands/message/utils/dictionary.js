const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link, iconPill, smallPill, citation, icon } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')

const { paginator } = require('../../../labscore/client');
const { dictionary } = require('../../../labscore/api');

const { Permissions } = require("detritus-client/lib/constants");

function createDictionaryPage(context, result, index){
  let phon = ''
  if(result.phonetic) phon = `\n*${result.phonetic}*`

  let e = createEmbed("default", context, {
    description: `${icon("definition")} **${link(`https://en.wiktionary.org/wiki/${encodeURIComponent(result.word)}`, result.word, "Definition on Wiktionary")}**`,
    fields: []
  })

  if(result.phonetic) e.description += smallPill(result.phonetic)

  let word = result.entries[index]
  let defItms = []

  let i = 1;
  for(const def of word.definitions){
    let entry = `${i}. ${def.definition}\n  - *${def.example}*`
    if(def.synonyms) entry += `\n${icon("empty")}${def.synonyms.splice(0, 5).map((s)=>smallPill(s)).join(' ')}`
    defItms.push(entry)
    i++
  }

  e.fields.push({
    name: word.type,
    value: defItms.join('\n')
  })

  let res = {"embeds": [e]}
  return res;
}

module.exports = {
  name: 'define',
  label: 'query',
  aliases: ['dictionary', 'dict'],
  metadata: {
    description: 'Returns dictionary definitions for words.',
    description_short: 'Dictionary word definitions.',
    examples: ['dictionary Walking'],
    category: 'utils',
    usage: 'define <query>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    try{
      let search = await dictionary(context, args.query)
      search = search.response
     
      if(search.body.status == 1) return editOrReply(context, createEmbed("warning", context, search.body.message))

      let pages = []

      let i = 0;
      for(const d of search.body.results[0].entries){
        pages.push(createDictionaryPage(context, search.body.results[0], i))
        i++;
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      console.log(e)
      if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, {embeds:[createEmbed("warning", context, e.response.body.message)]})
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform dictionary lookup.`)]})
    }
  },
};