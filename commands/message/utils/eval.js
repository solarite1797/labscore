
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
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
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
    let code = args.code;
    if(args.lang == "node"){
      const e=JSON.parse(JSON.stringify({client:{_events:{},_eventsCount:0,_maxListeners:12,_isBot:!0,_killed:!1,application:{},cluster:{},commandClient:{},imageFormat:"png",token:"NjgyNjU0NDY2NDUzMDEyNTUz.Gz-cd5.tncCMMDjDtDJ1E4TpQ3_-XwBAqyU-9zfaTu0Ek",ran:!0,owners:"[Collection (0 items)]",applications:"[Collection (0 items)]",channels:"[Collection (0 items)]",connectedAccounts:"[Collection (0 items)]",emojis:"[Collection (0 items)]",guilds:"[Collection (0 items)]",members:"[Collection (0 items)]",messages:"[Collection (0 items)]",notes:"[Collection (0 items)]",presences:"[Collection (0 items)]",relationships:"[Collection (0 items)]",roles:"[Collection (0 items)]",sessions:"[Collection (0 items)]",typings:"[Collection (0 items)]",users:"[Collection (0 items)]",voiceCalls:"[Collection (0 items)]",voiceConnections:"[Collection (0 items)]",voiceStates:"[Collection (0 items)]"}}));code=`const context = ${JSON.stringify(e)};\nconst ctx = context;\nconst client = ${JSON.stringify(e.client)};\n`+code;
    }

    let compArgs = "";
    if(REXTESTER_COMPILER_ARGS[REXTESTER_LANGUAGES[args.lang]]) compArgs = REXTESTER_COMPILER_ARGS[REXTESTER_LANGUAGES[args.lang]]
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
        .field('Program', code)
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