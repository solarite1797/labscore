const { paginator } = require("../../../labscore/client");
const { createEmbed, page, formatPaginationEmbeds } = require("../../../labscore/utils/embed");
const { codeblock } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");

const { Permissions } = require("detritus-client/lib/constants");

const TEX_REGEX = /(\$.*?\$)/g
const TEX_URL = `https://latex.codecogs.com/png.image?\\inline&space;\\huge&space;\\dpi{200}&space;\\color{white}`

module.exports = {
  name: 'latex',
  aliases: ['tex'],
  label: 'content',
  metadata: {
    description: 'Renders LaTeX expressions.\nReply to a message to render TeX from it.',
    description_short: 'LaTeX preview.',
    category: 'utils',
    usage: 'latex <expression>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.READ_MESSAGE_HISTORY, Permissions.USE_EXTERNAL_EMOJIS],
  run: async (context, args) => {
    context.triggerTyping();

    let content = args.content
    if (context.message.messageReference) {
      let msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
      if(msg.content && msg.content.length) content = msg.content
      if(msg.embeds?.length) for(const e of msg.embeds) if(e[1].description?.length) { content += '\n' + e[1].description; break; } 
    }

    let texBlocks = content.match(TEX_REGEX);

    let pages = [];
    for(const t of texBlocks){
      let description;
      if(args.content.includes('-i')) description = codeblock("tex", [t])
      pages.push(page(createEmbed("default", context, {
        description,
        image: {
          url: TEX_URL + encodeURIComponent(t.substr(1,t.length - 2))
        }
      })))
    }

    return await paginator.createPaginator({
      context,
      pages: formatPaginationEmbeds(pages)
    });
  },
};