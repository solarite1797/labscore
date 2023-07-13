const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link, iconPill, smallPill, citation, icon } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')

const { paginator } = require('../../../labscore/client');
const { dictionary } = require('../../../labscore/api');

const { Permissions } = require("detritus-client/lib/constants");

function createDictionaryPage(context, result, word){
  let phon = ''
  if(result.phonetic) phon = `\n*${result.phonetic}*`

  let e = createEmbed("default", context, {
    description: `${icon("book")} **${link(`https://en.wiktionary.org/wiki/${encodeURIComponent(word.word)}`, word.word, "Definition on Wiktionary")}**`,
    fields: []
  })

  if(word.phonetics) e.description += smallPill(word.phonetics)

  let def = word.definitions[result]

  let ref = 1;
  let defDesc = []

  for(const d of def){
    let defItms = [`**${ref}.** `]
    defItms.push(d.definition, citation(ref, d.src))
    if(d.examples) defItms.push(`\n ​ ​ ${icon("message")} *${d.examples.join(`*\n ​ ​ ${icon("message")} *`)}*`)
    // Synonyms are limited to 5 to prevent overflow
    if(d.synonyms) defItms.push(`\n ​ ​ ${iconPill("book", "Synonyms")} ${d.synonyms.splice(0, 5).map((s)=>smallPill(s)).join(' ')}`)

    ref++;
    if([...defDesc, defItms.join(' ')].join('\n\n').length >= 1024) continue;
    defDesc.push(defItms.join(''))
  }

  e.fields.push({
    name: result,
    value: defDesc.join('\n\n')
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
      for(const res of Object.keys(search.body.result.definitions)){
        pages.push(createDictionaryPage(context, res, search.body.result))
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, {embeds:[createEmbed("warning", context, e.response.body.message)]})
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform dictionary lookup.`)]})
    }
  },
};