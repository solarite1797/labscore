const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { codeblock, icon, pill, stringwrap, smallIconPill } = require('../../../labscore/utils/markdown');

const { isSupported, getCodeFromAny } = require('../../../labscore/utils/translate');
const { googleTranslate } = require('../../../labscore/api');
const { STATICS } = require('../../../labscore/utils/statics');
const { TRANSLATE_LANGUAGES, TRANSLATE_LANGUAGE_MAPPINGS } = require('../../../labscore/constants');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'translate',
  label: 'text',
  aliases: ['tr'],
  metadata: {
    description: `${smallIconPill("reply", "Supports Replies")}\n\nTranslates text. Supports automatic source language detection.`,
    description_short: 'Translate text.',
    examples: ['tr groß nussig -from de -to en'],
    category: 'utils',
    usage: `tr <text> [-to <target language>] [-from <origin language>]`
  },
  args: [
    {name: 'to', default: 'en', type: 'language', help: "Target Language"},
    {name: 'from', default: 'auto', type: 'language', help: "Source Language"}
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.READ_MESSAGE_HISTORY, Permissions.USE_EXTERNAL_EMOJIS],
  run: async (context, args) => {
    await context.triggerTyping();

    let content = args.text;
    if(context.message.messageReference) {
      let msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId);
      if(msg.content && msg.content.length) content = msg.content
      if(msg.embeds?.length) for(const e of msg.embeds) if(e[1].description?.length) { content += '\n' + e[1].description; break; } 

      // Translate using direct language input
      if(args.text) args.to = args.text;
    }

    if(!content.length) return editOrReply(context, createEmbed("warning", context, "No text supplied."))
    
    if(!isSupported(args.to)) return editOrReply(context, createEmbed("warning", context, `Invalid target language (${stringwrap(args.to, 10, false)}).`))
    if(!isSupported(args.from)) return editOrReply(context, createEmbed("warning", context, `Invalid source language (${stringwrap(args.from, 10, false)}).`))

    let targetLanguage = getCodeFromAny(args.to)
    let sourceLanguage = getCodeFromAny(args.from)
    
    if(!targetLanguage) return editOrReply(context, createEmbed("warning", context, `Invalid target language (${stringwrap(args.to, 10, false)}).`))
    if(!sourceLanguage) return editOrReply(context, createEmbed("warning", context, `Invalid source language (${stringwrap(args.from, 10, false)}).`))

    try{
      let translate = await googleTranslate(context, content, targetLanguage, sourceLanguage)

      let fromFlag = TRANSLATE_LANGUAGE_MAPPINGS[translate.response.body.language.from || sourceLanguage] || ''
      let toFlag = TRANSLATE_LANGUAGE_MAPPINGS[translate.response.body.language.to] || ''

      return editOrReply(context, createEmbed("default", context, {
        description: `${icon("locale")} ​ ${fromFlag} ${pill(TRANSLATE_LANGUAGES[translate.response.body.language.from || sourceLanguage] || translate.response.body.language.from || args.from)} ​ ​ ​​${icon("arrow_right")} ​ ​ ​ ​${toFlag} ${pill(TRANSLATE_LANGUAGES[translate.response.body.language.to] || translate.response.body.language.to)}\n${codeblock("ansi", [translate.response.body.translation])}`,
        footer: {
          iconUrl: STATICS.google,
          text: `Google Translator • ${context.application.name}`
        }
      }))
    }catch(e){
      console.log(e)
      if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, createEmbed("error", context, `Unable to translate text.`))
      return editOrReply(context, createEmbed("error", context, `Something went wrong.`))
    }
  }
};