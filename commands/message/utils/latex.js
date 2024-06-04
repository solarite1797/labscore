const { paginator } = require("../../../labscore/client");
const { createEmbed, page, formatPaginationEmbeds } = require("../../../labscore/utils/embed");
const { codeblock, pill, smallIconPill } = require("../../../labscore/utils/markdown");

const { Permissions } = require("detritus-client/lib/constants");
const { editOrReply } = require("../../../labscore/utils/message");

const TEX_REGEX = /(\$.*?\$)/g
const TEX_URL = `https://latex.codecogs.com/png.image?\\inline&space;\\huge&space;\\dpi{200}&space;\\color{white}`

const superagent = require('superagent');
const { STATIC_ICONS } = require("../../../labscore/utils/statics");
const { COLORS } = require("../../../labscore/constants");

module.exports = {
  name: 'latex',
  aliases: ['tex'],
  label: 'content',
  metadata: {
    description: `${smallIconPill("reply", "Supports Replies")}\n\nRenders LaTeX expressions.\n\nAdding ${pill('-i')} will include the detected expression.`,
    description_short: 'LaTeX preview.',
    category: 'utils',
    usage: 'latex <expression> [-i]'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.READ_MESSAGE_HISTORY, Permissions.USE_EXTERNAL_EMOJIS],
  run: async (context, args) => {
    context.triggerTyping();

    let content = args.content
    if (context.message.messageReference) {
      let msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
      if(msg.content && msg.content.length) content = msg.content
      if(msg.embeds?.length) for(const e of msg.embeds) if(e[1].description?.length) { content += '\n' + e[1].description; break; } 
    } else {
      if(content.length && !content.includes("$")) content = `$${content}$`
    }

    let texBlocks = content.match(TEX_REGEX);

    if(!texBlocks) return editOrReply(context, createEmbed("warning", context, "No expressions found."))

    let pages = [];
    for(const t of texBlocks){
      let description;
      if(args.content.includes('-i')) description = codeblock("tex", [t])
      try{
        await superagent.get(TEX_URL + encodeURIComponent(t.substr(1,t.length - 2)))
        pages.push(page(createEmbed("default", context, {
          description,
          image: {
            url: TEX_URL + encodeURIComponent(t.substr(1,t.length - 2))
          }
        })))
      }catch(e){
        pages.push(page(createEmbed("default", context, {
          description: codeblock("tex", [t]),
          author: {
            iconUrl: STATIC_ICONS.warning,
            name: "Unable to render expression."
          },
          color: COLORS.warning
        })))
      }
      
    }

    return await paginator.createPaginator({
      context,
      pages: formatPaginationEmbeds(pages)
    });
  },
};