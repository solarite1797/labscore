const { reddit } = require('#api');
const { paginator } = require('#client');

const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed')
const { link, icon, iconPill } = require('#utils/markdown')
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics')

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

function createRedditPage(context, result) {
  let res = page(createEmbed("default", context, {
    author: {
      iconUrl: result.subreddit.icon,
      name: result.subreddit.name,
      url: result.subreddit.link
    },
    footer: {
      iconUrl: STATICS.reddit,
      text: `Reddit • ${context.application.name}`
    }
  }))

  if (result.post.image) res.embeds[0].image = { url: result.post.image };

  let description = [`**${link(result.post.link, result.post.title)}**`]

  let awardData = []
  // Awards
  //for(const a of Object.keys(result.awards)){
  //  awardData.push(`${icon(`reddit_${a}`)}${highlight(result.awards[a])}`)
  //}

  if (awardData.length >= 1) description.push(`${awardData.join(' ')}`)

  description.push(``)
  description.push(`${iconPill("upvote", result.post.score)}  ​  ${icon("user")} ${link(result.author.link, `u/${result.author.name}`)}`)

  res.embeds[0].description = description.join('\n')
  return res;
}

module.exports = {
  name: 'reddit',
  label: 'query',
  aliases: ['r'],
  metadata: {
    description: 'Returns search results from reddit. Allows global and subreddit-specific search.',
    description_short: 'Search on Reddit',
    examples: ['reddit r/otters'],
    category: 'search',
    usage: 'reddit [r/<subreddit>] <query> [-type image]'
  },
  args: [
    { default: "all", name: "type", type: "image", help: "Types of post the search query should return" }
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if (!args.query) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (query).`))
    try {
      let search = await reddit(context, args.query, context.channel.nsfw)
      search = search.response

      if (search.body.status == 2) return editOrReply(context, createEmbed("error", context, search.body.message))

      let pages = []
      for (const res of search.body.results) {
        if (args.type == "image" && !res.post.image) continue;
        pages.push(createRedditPage(context, res))
      }

      if (pages.length == 0) return editOrReply(context, createEmbed("warning", context, `No results found.`))

      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    } catch (e) {
      console.log(e)
      if (e.response && e.response.body.message) return editOrReply(context, createEmbed("error", context, e.response.body.message))
      return editOrReply(context, createEmbed("error", context, `Unable to perform reddit search.`))
    }
  },
};