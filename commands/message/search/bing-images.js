const { createEmbed, formatPaginationEmbeds, page } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { bingImages } = require('../../../labscore/api');

const { Permissions } = require("detritus-client/lib/constants");

function createImageResultPage(context, result) {
  let res = page(
    createEmbed("default", context, {
      author: {
        iconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(result.url)}&sz=256`,
        name: result.title,
        url: result.url
      },
      image: {
        url: result.image
      },
      footer: {
        iconUrl: STATICS.bing,
        text: `Microsoft Bing • ${context.application.name}`
      }
    }))
  if (result.thumbnail) res.embeds[0].thumbnail = { url: result.thumbnail };
  return res;
}

module.exports = {
  name: 'bingimage',
  label: 'query',
  aliases: ['bi', 'bimg', 'img2'],
  metadata: {
    description: 'Returns image search results from Microsoft Bing.',
    description_short: 'Search on Bing Images',
    examples: ['bing Eurasian Small Clawed Otter'],
    category: 'search',
    usage: 'bing <query>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if (!args.query) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (query).`))
    try {
      let search = await bingImages(context, args.query, context.channel.nsfw)
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
      return editOrReply(context, createEmbed("error", context, `Unable to perform bing search.`))
    }
  },
};