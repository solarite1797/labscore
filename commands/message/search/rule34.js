const { createEmbed, formatPaginationEmbeds, page } = require('../../../labscore/utils/embed')
const { pill } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')

const { paginator } = require('../../../labscore/client');
const { rule34 } = require('../../../labscore/api');

const { Permissions } = require("detritus-client/lib/constants");

function createRule34Page(context, result) {
  let res = page(createEmbed("default", context, {
    description: '',
    image: {
      url: result.fileUrl
    },
    footer: {
      text: `Rating: ${result.rating}`
    }
  }))

  // Render a few tags
  if (result.tags) {
    let tags = result.tags.splice(0, 5)
    let tagDisplay = ''
    for (const t of tags) tagDisplay += pill(t)
    res.embeds[0].description += `\n${tagDisplay}`
  }

  return res;
}

const SITES = {
  "rule34": "rule34.xxx",
  "e621": "e621.net",
  "danbooru": "danbooru.donmai.us",
  "gelbooru": "gelbooru.com",
  "paheal": "rule34.paheal.net",
  "xbooru": "xbooru.com",
  "safebooru": "safebooru.org"
}

module.exports = {
  name: 'rule34',
  label: 'query',
  aliases: ['r34'],
  metadata: {
    description: 'Returns image search results from various rule34-focused sites.',
    description_short: 'Search on rule34 sites',
    explicit: true,
    examples: ['r34 vaporeon -site e621'],
    category: 'search',
    usage: 'rule34 <query> [-site <service>]'
  },
  args: [
    { name: 'site', default: 'rule34', type: 'string', help: `Site to search on \` ${Object.keys(SITES).join(', ')} \`` }
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();

    // very important, maybe make this a command option eventually
    if (!context.channel.nsfw) {
      return editOrReply(context, createEmbed("nsfw", context))
    }

    if (!args.query) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (query).`))
    if (!Object.keys(SITES).includes(args.site.toLowerCase())) return editOrReply(context, createEmbed("warning", context, `Invalid site type.`))
    try {
      let search = await rule34(context, args.query, args.site.toLowerCase())
      search = search.response

      if (search.body.status == 2) return editOrReply(context, createEmbed("error", context, search.body.message))
      if (search.body.data.length == 0) return editOrReply(context, createEmbed("warning", context, `No results found on ${SITES[args.site.toLowerCase()]}.`))

      let pages = []
      for (const res of search.body.data) {
        pages.push(createRule34Page(context, res))
      }

      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    } catch (e) {
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform rule34 search.`))
    }
  },
};