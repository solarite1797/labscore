const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { iconPill, smallIconPill } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");
const { canUseLimitedTestCommands } = require('../../../labscore/utils/testing')
const { STATIC_ICONS } = require('../../../labscore/utils/statics');
const { summarizeWebpage } = require('../../../labscore/api/obelisk');

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([^> ]*)/

module.exports = {
  name: 'summarize',
  aliases: ['summary','tldr'],
  label: 'text',
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n${smallIconPill("reply", "Supports Replies")}\n\nSummarize web pages and articles.`,
    description_short: 'Website summaries.',
    examples: ['tldr https://www.theverge.com/2023/11/17/23965185/discord-is-shutting-down-its-ai-chatbot-clyde'],
    category: 'limited',
    usage: 'summarize'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!canUseLimitedTestCommands(context)) return;
    context.triggerTyping();

    let content = args.text;
    if(context.message.messageReference) {
      let msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId);

      if(msg.content && msg.content.length) content = msg.content
      else if(msg.embeds?.length) for(const e of msg.embeds) if(e[1].description?.length) { content = e[1].description; break; } 
    }

    let webUrl = content.match(URL_REGEX)
    if(!webUrl) return editOrReply(context, createEmbed("warning", context, `No URLs found.`))
    try{
      await editOrReply(context, createEmbed("ai_custom", "Generating page summary...", STATIC_ICONS.ai_summary))
      
      let res = await summarizeWebpage(context, webUrl[0])
      if(!res.response.body.summaries) return editOrReply(context, createEmbed("error", context, "Summary generation failed."))

      return editOrReply(context, createEmbed("defaultNoFooter", context, {
        author: {
          iconUrl: STATIC_ICONS.ai_summary,
          name: res.response.body.title || 'Key points from the page',
          url: webUrl[0]
        },
        description: '- ' + res.response.body.summaries.join('\n- '),
        footer: {
          text: "Generative AI is experimental. Response may be factually wrong or completely made up."
        }
      }))
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, e.response.body.message))
    }
  }
};