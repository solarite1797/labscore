const { googleTranslate } = require('#api');
const { TRANSLATE_LANGUAGES, TRANSLATE_LANGUAGE_MAPPINGS } = require('#constants');

const { createEmbed } = require('#utils/embed')
const { codeblock, icon, pill, stringwrap, smallIconPill } = require('#utils/markdown');
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics');
const { isSupported, getCodeFromAny } = require('#utils/translate');

// TODO: Turn this into a general purpose permissions constant
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

    // TODO: Turn this into a reply helper
    if(context.message.messageReference) {
      let msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId);
      if(msg.content && msg.content.length) content = msg.content
      if(msg.embeds?.length) for(const e of msg.embeds) if(e[1].description?.length) { content += '\n' + e[1].description; break; } 

      // Controls ctx-based translations
      if(args.text.length >= 1 && getCodeFromAny(args.text)) args.to = args.text;
      else if(args.text.length >= 1) content = args.text;

      console.log(args)
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
      if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, createEmbed("error", context, `Unable to translate text.`))
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Something went wrong.`))
    }
  }
};