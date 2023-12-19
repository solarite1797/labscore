const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const superagent = require('superagent')
const { codeblock, iconPill, smallIconPill } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");
const { canUseLimitedTestCommands } = require('../../../labscore/utils/testing')
const { STATICS } = require('../../../labscore/utils/statics');
const { chatgpt } = require('../../../labscore/api/obelisk');

module.exports = {
  name: 'disstrack',
  label: 'text',
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nAI Generated Disstracks, powered by ChatGPT`,
    description_short: 'AI generated disstracks.',
    examples: ['disstrack'],
    category: 'limited',
    usage: 'disstrack <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!canUseLimitedTestCommands(context)) return;
    context.triggerTyping();
    if(!args.text) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (text).`))
    try{
      await editOrReply(context, createEmbed("ai", context, "Spitting bars..."))
      
      let res = await chatgpt(context, "Write a disstrack about the subject the user supplies. The disstrack should have at least one verse and a chorus.", args.text);
      res = res.response;

      return editOrReply(context, createEmbed("default", context, {
        description: smallIconPill("generative_ai", args.text) + '\n' + codeblock("ansi", [res.body.output.substr(0, 2020 - args.text.length)]),
        footer: {
          text: `Generative AI is experimental. • ${context.application.name}`,
          iconUrl: STATICS.openai
        }
      }))
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to generate text.`))
    }
  }
};