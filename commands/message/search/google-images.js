const { googleImages } = require('#api');
const { paginator } = require('#client');

const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed')
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics')

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

// TODO: create a favicon() util
function createImageResultPage(context, result) {
  let res = page(createEmbed("default", context, {
    author: {
      iconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(result.url)}&sz=256`,
      name: result.title,
      url: result.url
    },
    image: {
      url: result.image
    },
    footer: {
      iconUrl: STATICS.google,
      text: `Google Images • ${context.application.name}`
    }
  }))
  if (result.thumbnail) res.embeds[0].thumbnail = { url: result.thumbnail };
  return res;
}

module.exports = {
  name: 'image',
  label: 'query',
  aliases: ['i', 'img'],
  metadata: {
    description: 'Returns image search results from Google.',
    description_short: 'Search on Google Images',
    examples: ['image Eurasian Small Clawed Otter'],
    category: 'search',
    usage: 'image <query>',
    slashCommand: "image"
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if (!args.query) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (query).`))
    try {
      let search = await googleImages(context, args.query, context.channel.nsfw)
      search = search.response

      if (search.body.status == 2) return editOrReply(context, createEmbed("error", context, search.body.message))

      let pages = []
      for (const res of search.body.results) {
        pages.push(createImageResultPage(context, res))
      }

      if (!pages.length) return editOrReply(context, createEmbed("warning", context, `No results found.`))

      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    } catch (e) {
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform google search.`))
    }
  },
};