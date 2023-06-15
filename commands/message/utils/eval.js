
const { DiscordRegexNames, Permissions } = require("detritus-client/lib/constants");
const { Utils } = require("detritus-client");

const { REXTESTER_LANGUAGES, COLORS, REXTESTER_COMPILER_ARGS } = require("../../../labscore/constants");

const superagent = require('superagent')

const { createEmbed } = require("../../../labscore/utils/embed");
const { codeblock, highlight } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");


module.exports = {
  label: 'code',
  name: 'eval',
  metadata: {
    description: `Evaluate code snippets. Supports codeblocks.\n\nSupported languages: ${highlight(Object.keys(REXTESTER_LANGUAGES).join(', '))}`,
    description_short: 'Evaluate code',
    examples: ['eval console.log(\'hi\') -lang js'],
    category: 'utils',
    usage: 'eval <code> [-lang <language>]'
  },
  args: [
    {name: 'lang', default: 'node'}
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS],
  run: async (context, args) => {
    context.triggerTyping();

    if(!args.code) return editOrReply(context, createEmbed("warning", context, "No code provided."))

    const { matches } = Utils.regex(DiscordRegexNames.TEXT_CODEBLOCK, args.code);

    if (matches.length) {
      args.code = matches[0].text;
      if(matches[0].language) args.lang = matches[0].language
    }

    if(!REXTESTER_LANGUAGES[args.lang.toLowerCase()]) return editOrReply(context, createEmbed("warning", context, "Unsupported language."))

    let data;

    let compArgs = "";
    if(REXTESTER_COMPILER_ARGS[args.lang]) compArgs = REXTESTER_COMPILER_ARGS[args.lang]
    try{
      data = await superagent.post(`https://rextester.com/rundotnet/Run`)
        .set({
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0",
          "Accept": "text/plain, */*; q=0.01",
          "Accept-Language": "en-US",
          "Prefer": "safe",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Pragma": "no-cache",
          "Cache-Control": "no-cache"
        })
        .field('CompilerArgs', compArgs)
        .field('Program', args.code)
        .field('LanguageChoiceWrapper', REXTESTER_LANGUAGES[args.lang])

      data = JSON.parse(data.text)
    }catch(e){
      console.log(e)
      return editOrReply(context, { embeds: [createEmbed("error", context, "Code execution failed.")] })
    }
    
    const embed = createEmbed("default", context, {})

    if(data.Errors !== null){
      embed.description = codeblock("js", ['​' + data.Errors.replace(/[0-9]*\/source/g, 'source').split('\n').splice(0,10).join('\n').substr(0,1000)])
      embed.color = COLORS.error
    } else {
      embed.description = codeblock("js", ['​' + data.Result.split('\n').splice(0,10).join('\n').substr(0,1000)])
      embed.color = COLORS.success
      if(data.Result.length == 0) embed.description = codeblock('js', ["No Output"])
    }

    return editOrReply(context, createEmbed("default", context, embed))
  },
};