const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link, pill, iconPill } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')

const { paginator } = require('../../../labscore/client');
const { dictionary } = require('../../../labscore/api');

function createDictionaryPage(context, result){
  let phon = ''
  if(result.phonetic) phon = `\n*${result.phonetic}*`

  let e = createEmbed("default", context, {
    description: `**${link(result.source, result.word)}**${phon}`,
    fields: [],
    thumbnail: {
      url: `https://cdn.discordapp.com/emojis/925891616986791936.png?size=4096`
    }
  })

  for(const d of result.definitions){
    let v = d.definition
    if(d.example) v = v + `\n\n${iconPill("pencil", "Example")}\n> ${d.example}`
    if(d.synonyms.length >= 1) v = v + `\n\n${iconPill("message", "Synonyms")}\n> *${d.synonyms.join(', ')}*`
    e.fields.push({
      name: d.type,
      value: v,
      inline: true
    })
  }

  let res = {"embeds": [e]}
  return res;
}

module.exports = {
  name: 'define',
  label: 'query',
  aliases: ['dictionary', 'dict'],
  metadata: {
    description: 'Returns dictionary definitions for words.',
    description_short: 'Dictionary definitions.',
    examples: ['dictionary Flask'],
    category: 'search',
    usage: 'define <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    try{
      let search = await dictionary(context, args.query)
      search = search.response
     
      if(search.body.status == 1) return editOrReply(context, createEmbed("warning", context, search.body.message))

      let pages = []
      for(const res of search.body.results){
        pages.push(createDictionaryPage(context, res))
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform dictionary lookup.`)]})
    }
  },
};