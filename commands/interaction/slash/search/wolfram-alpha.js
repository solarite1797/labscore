const { createEmbed, formatPaginationEmbeds, page } = require('../../../../labscore/utils/embed')
const { editOrReply } = require('../../../../labscore/utils/message')
const { STATICS } = require('../../../../labscore/utils/statics')

const { paginator } = require('../../../../labscore/client');
const { wolframAlpha } = require('../../../../labscore/api');
const { citation } = require('../../../../labscore/utils/markdown');
const { ApplicationCommandTypes, InteractionCallbackTypes } = require('detritus-client/lib/constants');

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
  description: 'Compute with Wolfram|Alpha.',
  name: 'wolfram-alpha',
  options: [
    {
      name: 'query',
      description: 'Computational query',
      type: ApplicationCommandTypes.STRING,
      required: true
    }
  ],
  run: async (context, args) => {
    await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

    if (!args.query) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (query).`))
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