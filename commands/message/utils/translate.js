const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { codeblock, highlight, icon, pill } = require('../../../labscore/utils/markdown');

const { isSupported } = require('../../../labscore/utils/translate');
const { googleTranslate } = require('../../../labscore/api');
const { STATICS } = require('../../../labscore/utils/statics');
const { TRANSLATE_LANGUAGES, TRANSLATE_LANGUAGE_MAPPINGS } = require('../../../labscore/constants');

module.exports = {
  name: 'translate',
  label: 'text',
  aliases: ['tr'],
  metadata: {
    description: 'Translates text. Supports automatic source language detection.',
    description_short: 'Translates text',
    examples: ['tr groß nussig -from de -to en'],
    category: 'utils',
    usage: `tr <text> [-to <target language>] [-from <origin language>]`
  },
  args: [
    {name: 'to', default: 'en', type: 'language', help: "Target Language"},
    {name: 'from', default: 'auto', type: 'language', help: "Source Language"}
  ],
  run: async (context, args) => {
    await context.triggerTyping();

    let content = args.text;
    if(context.message.messageReference) {
      let msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId);
      if(msg.content && msg.content.length) content = msg.content
    }

    if(!content.length) return editOrReply(context, createEmbed("warning", context, "No text supplied."))
    
    if(!isSupported(args.to)) return editOrReply(context, createEmbed("warning", context, "Invalid language (to)."))
    if(!isSupported(args.from)) return editOrReply(context, createEmbed("warning", context, "Invalid language (from)."))

    try{
      let translate = await googleTranslate(context, content, args.to, args.from)

      let fromFlag = TRANSLATE_LANGUAGE_MAPPINGS[translate.response.body.language.from || args.from] || ''
      let toFlag = TRANSLATE_LANGUAGE_MAPPINGS[translate.response.body.language.to] || ''
      return editOrReply(context, createEmbed("default", context, {
        description: `${icon("locale")} ​ ${fromFlag} ${pill(TRANSLATE_LANGUAGES[translate.response.body.language.from || args.from])} ​ ​ ​​${icon("arrow_right")} ​ ​ ​ ​${toFlag} ${pill(TRANSLATE_LANGUAGES[translate.response.body.language.to])}\n${codeblock("ansi", [translate.response.body.translation])}`,
        footer: {
          iconUrl: STATICS.google,
          text: `Google Translator • ${context.application.name} • Took ${translate.timings}s`
        }
      }))
    }catch(e){
      console.log(e)
      if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to translate text.`)]})
      return editOrReply(context, {embeds:[createEmbed("error", context, `Something went wrong.`)]})
    }
  }
};