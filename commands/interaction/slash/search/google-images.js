const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = Constants;

const { createEmbed, page, formatPaginationEmbeds } = require('../../../../labscore/utils/embed');

const { paginator } = require('../../../../labscore/client');
const { STATICS } = require('../../../../labscore/utils/statics');
const { google, googleImages } = require('../../../../labscore/api');
const { editOrReply } = require('../../../../labscore/utils/message');

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
  description: 'Search on Google Images.',
  name: 'google-images',
  options: [
    {
      name: 'query',
      description: 'Search query',
      type: ApplicationCommandOptionTypes.STRING,
      required: true
    }
  ],
  run: async (context, args) => {
    await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

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
  }
};