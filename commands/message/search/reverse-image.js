const { reverseImageSearch } = require('#api');
const { paginator } = require('#client');

const { getRecentImage } = require("#utils/attachment");
const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed')
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics')

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

// TODO: create a favicon() util
function createReverseImageSearchResultPage(context, result, source) {
  let res = page(
    createEmbed("default", context, {
      author: {
        iconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(result.url)}&sz=256`,
        name: result.name,
        url: result.url
      },
      image: {
        url: result.image
      },
      thumbnail: {
        url: source
      },
      footer: {
        iconUrl: STATICS.google,
        text: `Google Cloud Vision • ${context.application.name}`
      }
    }))
  if (result.thumbnail) res.embeds[0].thumbnail = { url: result.thumbnail };
  return res;
}

module.exports = {
  name: 'reverse-image',
  aliases: ['reverse', 'reverseimage'],
  metadata: {
    description: 'Performs a reverse-image-search.',
    description_short: 'Reverse image search',
    category: 'search',
    usage: 'reverse <image>',
    slashCommand: "Reverse Image Search"
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    context.triggerTyping();
    try {
      let image = await getRecentImage(context, 50)
      if (!image) return editOrReply(context, createEmbed("warning", context, "No images found."))

      let search = await reverseImageSearch(context, image)
      search = search.response

      if (search.body.status == 2) return editOrReply(context, createEmbed("error", context, search.body.message))

      let pages = []
      for (const res of search.body.results) {
        pages.push(createReverseImageSearchResultPage(context, res, image))
      }

      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    } catch (e) {
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform reverse image search.`))
    }
  },
};