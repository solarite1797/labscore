const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')
const { link, icon, highlight, iconPill } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { reddit } = require('../../../labscore/api');

function createRedditPage(context, result){
  let res = {
    "embeds": [
      createEmbed("default", context, {
        author: {
          iconUrl: result.subreddit.icon,
          name: result.subreddit.name,
          url: result.subreddit.link
        },
        footer: {
          iconUrl: STATICS.reddit,
          text: `Reddit • ${context.application.name}`
        }
      })
    ]
  }

  if(result.post.image) res.embeds[0].image = { url: result.post.image };

  let description = [`**${link(result.post.link, result.post.title)}**`]

  let awardData = []
  // Awards
  for(const a of Object.keys(result.awards)){
    awardData.push(`${icon(`reddit_${a}`)}${highlight(result.awards[a])}`)
  }

  if(awardData.length >= 1) description.push(`${awardData.join(' ')}`)

  description.push(``)
  description.push(`${iconPill("upvote", result.post.score)}  ​  ${icon("person")} ${link(result.author.link, `u/${result.author.name}`)}`)

  res.embeds[0].description = description.join('\n')
  return res;
}

module.exports = {
  name: 'reddit',
  label: 'query',
  aliases: ['r'],
  metadata: {
    description: 'reddit search',
    examples: ['reddit r/otters'],
    category: 'search',
    usage: 'reddit [r/<subreddit>] <query> [-type image]'
  },
  args: [
    { default: "all", name: "type", type: "image" }
  ],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await reddit(context, args.query, context.channel.nsfw)
      search = search.response
     
      if(search.body.status == 2) return editOrReply(context, {embeds:[createEmbed("error", context, search.body.message)]})

      let pages = []
      for(const res of search.body.results){
        if(args.type == "image" && !res.post.image) continue;
        pages.push(createRedditPage(context, res))
      }
      
      if(pages.length == 0) return editOrReply(context, {embeds:[createEmbed("warning", context, `No results found.`)]})

      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform reddit search.`)]})
    }
  },
};