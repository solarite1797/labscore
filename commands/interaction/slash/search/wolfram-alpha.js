const { wolframAlpha } = require('#api');
const { paginator } = require('#client');

const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed');
const { acknowledge } = require('#utils/interactions');
const { citation } = require('#utils/markdown');
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics')

const { ApplicationCommandOptionTypes } = require('detritus-client/lib/constants');

function createWolframPage(context, pod, query, sources) {
  let res = page(createEmbed("default", context, {
    author: {
      name: pod.title,
      url: `https://www.wolframalpha.com/input?i=${encodeURIComponent(query)}`
    },
    description: undefined,
    footer: {
      iconUrl: STATICS.wolframalpha,
      text: `Wolfram|Alpha • ${context.application.name}`
    }
  }))
  if (pod.icon) res.embeds[0].author.iconUrl = pod.icon
  if (pod.value) res.embeds[0].description = pod.value.substr(0, 1000)
  if (pod.value && pod.refs) {
    for (const r of pod.refs) {
      let src = Object.values(sources).filter((s) => s.ref == r)[0]
      if (!src) continue;

      // Only add a direct source if one is available
      if (src.collections) {
        res.embeds[0].description += citation(r, src.url, src.title + ' | ' + src.collections[0].text)
        continue;
      }
      if (src.url) res.embeds[0].description += citation(r, src.url, src.title)
    }
  }
  if (pod.image) res.embeds[0].image = { url: pod.image };
  return res;
}

module.exports = {
  name: 'wolframalpha',
  description: 'Compute a query via Wolfram|Alpha.',
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
      description: 'Computational Query.',
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
      let search = await wolframAlpha(context, args.query)
      search = search.response

      if (search.body.status == 1) return editOrReply(context, createEmbed("warning", context, search.body.message))

      let pages = []
      for (const res of search.body.data) {
        pages.push(createWolframPage(context, res, args.query, search.body.sources))
      }

      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    } catch (e) {
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform Wolfram|Alpha search.`))
    }
  },
};