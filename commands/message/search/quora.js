const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link, pill } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { bing, quora } = require('../../../labscore/api');

function createQuoraAnswerPage(context, question, answer){
  let tags = question.tags.map((t) => {
    return pill(t)
  })
  let res = {
    "embeds": [
      createEmbed("default", context, {
        title: question.title,
        url: answer.url,
        description: `${tags.splice(0, 4).join('  ')}\n\n${answer.content.substr(0,1000)}`,
        footer: {
          iconUrl: STATICS.quora,
          text: `Quora • ${context.application.name}`
        }
      })
    ]
  }
  if(answer.author){
    res.embeds[0].author = {
      name: answer.author.name.substr(0,1000),
      iconUrl: answer.author.icon,
      url: answer.author.url
    }
  }
  return res;
}

module.exports = {
  name: 'quora',
  label: 'query',
  aliases: ['q'],
  metadata: {
    description: 'Searches for questions on Quora.',
    description_short: 'Quora Search',
    examples: ['quora How does Quora work?'],
    category: 'search',
    usage: 'quora <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await quora(context, args.query)
      search = search.response.body
     
      if(search.status == 2) return editOrReply(context, {embeds:[createEmbed("error", context, search.message)]})
      
      let pages = []
      // Create the initial page

      for(const answer of search.answers){
        pages.push(createQuoraAnswerPage(context, search.question, answer))
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform quora search.`)]})
    }
  },
};