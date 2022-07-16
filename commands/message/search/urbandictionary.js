const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link, icon, highlight } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { urbandictionary } = require('../../../labscore/api');

function createUrbanPage(context, result){
  let e = createEmbed("default", context, {
    description: `**${link(result.link, result.title)}**`,
    fields: [],
    footer: {
      iconUrl: STATICS.urbandictionary,
      text: `UrbanDictionary • ${context.application.name}`
    }
  })
  if(result.description) e.fields.push({
    name: "Description",
    value: result.description.substr(0, 1023),
    inline: true
  })
  e.fields.push({
    name: "Stats",
    value: `${icon("upvote")}${highlight(result.score.likes)}  ${icon("downvote")}${highlight(result.score.dislikes)}\n**Author:** ${link(`https://www.urbandictionary.com/author.php?author=${encodeURIComponent(result.author)}`, result.author)}`,
    inline: true
  })
  if(result.example) e.fields.push({
    name: "Example",
    value: result.example.substr(0, 1023),
    inline: false
  })
  let res = {"embeds": [e]}
  return res;
}

module.exports = {
  name: 'urbandictionary',
  label: 'query',
  aliases: ['urban', 'ud'],
  metadata: {
    description: 'urban dictionary definitions (might be nsfw).\nproviding no search term returns random results.',
    examples: ['ud Flask'],
    category: 'search',
    usage: 'urbandictionary <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    try{
      let search = await urbandictionary(context, args.query)
      search = search.response
     
      if(search.body.status == 1) return editOrReply(context, createEmbed("warning", context, search.body.message))

      let pages = []
      for(const res of search.body.results){
        pages.push(createUrbanPage(context, res))
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform urban dictionary search.`)]})
    }
  },
};