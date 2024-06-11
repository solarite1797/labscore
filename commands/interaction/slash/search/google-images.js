const { googleImages } = require('#api');
const { paginator } = require('#client');

const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed');
const { acknowledge } = require('#utils/interactions');
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics')

const { ApplicationCommandOptionTypes } = require('detritus-client/lib/constants');

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
  description: 'Search the web for images on Google.',
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  options: [
    {
      name: 'query',
      description: 'Image search query.',
      type: ApplicationCommandOptionTypes.TEXT,
      required: true
    },
    {
      name: 'incognito',
      description: 'Makes the response only visible to you.',
      type: ApplicationCommandOptionTypes.BOOLEAN,
      required: false,
      default: false
    }
  ],
  run: async (context, args) => {
    await acknowledge(context, args.incognito);

    try {
        let search = await googleImages(context, args.query, false) //safesearch is always on
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