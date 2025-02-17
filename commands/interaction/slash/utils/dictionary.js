const { dictionary } = require('#api');
const { paginator } = require('#client');
const { TRANSLATE_LANGUAGE_MAPPINGS, DICTIONARY_LANGUAGES } = require('#constants');

const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed');
const { acknowledge } = require('#utils/interactions');
const { link, iconPill, smallPill, icon, iconLinkPill, pill } = require('#utils/markdown')
const { editOrReply } = require('#utils/message')

const { ApplicationCommandOptionTypes } = require('detritus-client/lib/constants');

const LABELS = {
  "offensive": `${iconPill("warning", "Offensive")}`
}

function createDictionaryPage(context, result, index, language){
  let phon = ''
  if(result.phonetic) phon = `\n*${result.phonetic}*`

  let e = createEmbed("default", context, {
    description: `${icon("definition")} **${link(`https://en.wiktionary.org/wiki/${encodeURIComponent(result.word)}`, result.word, "Definition on Wiktionary")}**`,
    fields: []
  })

  if(result.phonetic) e.description += smallPill(result.phonetic)

  if(language !== "en") e.description += `\n${TRANSLATE_LANGUAGE_MAPPINGS[language]} ${pill(DICTIONARY_LANGUAGES[language])}`

  let word = result.entries[index]
  let defItms = []


  let i = 1;
  for(const def of word.definitions.splice(0, 6)){
    let entry = `${i}. ${def.definition}`
    if(def.example) entry += `\n  - *${def.example}*`
    if(def.synonyms) entry += `\n${icon("empty")}${def.synonyms.splice(0, 4).map((s)=>smallPill(s)).join(' ')}`
    defItms.push(entry)
    i++
  }

  if(word.definitions.length >= 6 ) defItms.push(iconLinkPill("link", `https://www.google.com/search?q=define+${encodeURIComponent(result.word)}`, 'More results', 'View More Results'))

  let type = word.type
  if(word.labels) type += " " + word.labels.map((label)=>{if(LABELS[label]) return LABELS[label]; else return ""}).join('  ')

  e.description += `\n\n**${type}**\n${defItms.join('\n\n')}`

  return page(e);
}

module.exports = {
  name: 'dictionary',
  description: 'Define a word from the dictionary.',
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  options: [
    {
      name: 'term',
      description: 'Term to look up.',
      type: ApplicationCommandOptionTypes.TEXT,
      required: true
    },
    {
      name: 'incognito',
      description: 'Makes the response only visible to you.',
      type: ApplicationCommandOptionTypes.BOOLEAN,
      required: false,
      default: false
    }
  ],
  run: async (context, args) => {
    await acknowledge(context, args.incognito);

    try{
      let search = await dictionary(context, args.term, "en")
      search = search.response
     
      if(search.body.status == 1) return editOrReply(context, createEmbed("warning", context, search.body.message))

      let pages = []

      let i = 0;
      for(const d of search.body.results[0].entries){
        pages.push(createDictionaryPage(context, search.body.results[0], i, "en"))
        i++;
      }
      
      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    }catch(e){
      if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, createEmbed("warning", context, e.response.body.message))
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform dictionary lookup.`))
    }
  },
};