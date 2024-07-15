const { dictionary } = require('#api');
const { paginator } = require('#client');
const { TRANSLATE_LANGUAGE_MAPPINGS, DICTIONARY_LANGUAGES } = require('#constants');

const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed')
const { link, iconPill, smallPill, icon, iconLinkPill, pill } = require('#utils/markdown')
const { editOrReply } = require('#utils/message')
const { dictionaryGetCodeFromAny } = require('#utils/translate');

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

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
  label: 'query',
  aliases: ['define', 'dict'],
  metadata: {
    description: 'Looks up words and teminology in a dictionary.',
    description_short: 'Dictionary word definitions.',
    examples: ['define Gehen -lang de'],
    category: 'utils',
    usage: 'dictionary <query> [-lang <language>]',
    slashCommand: "dictionary"
  },
  args: [
    {name: 'lang', default: 'en', type: 'language', help: "Language to define in"},
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();

    let language = dictionaryGetCodeFromAny(args.lang);

    if(!language) return editOrReply(context, createEmbed("warning", context, "Invalid Language"))

    try{
      let search = await dictionary(context, args.query, language)
      search = search.response
     
      if(search.body.status == 1) return editOrReply(context, createEmbed("warning", context, search.body.message))

      let pages = []

      let i = 0;
      for(const d of search.body.results[0].entries){
        pages.push(createDictionaryPage(context, search.body.results[0], i, language))
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