const { perspective } = require("../../../labscore/api");
const { format } = require("../../../labscore/utils/ansi");
const { createEmbed } = require("../../../labscore/utils/embed");

const { icon, codeblock, iconPill, stringwrap, link } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

const { Permissions } = require("detritus-client/lib/constants");

function getPerspectiveColor(score) {
  if (score >= 0.9) return "m"
  if (score >= 0.76) return "r"
  if (score >= 0.5) return "y"
  return "g"
}

function formatPerspectiveScores(data) {
  let entries = [];
  let srt = [];

  for (const scr of Object.keys(data.scores)) {
    let score = data.scores[scr];
    perc = `${score.toString().substr(2, 2)}.${score.toString().substr(3, 1)}`
    if (perc.startsWith('0')) perc = ` ${perc.substr(1, perc.length)}`
    srt.push(`${data.scores[scr]}|${format(perc + '%', getPerspectiveColor(score))}   ${scr.substr(0, 1).toUpperCase()}${scr.substr(1, scr.length).toLowerCase().replace(/_/g, ' ')}`)
  }
  for (const i of srt.sort().reverse()) entries.push(i.split('|')[1])
  return entries
}

module.exports = {
  label: "input",
  name: "perspective",
  metadata: {
    description: `Uses Perspective to judge the toxicity of a prompt.`,
    description_short: `Toxicity scores for prompts.`,
    examples: ['perspective I hate otters.'],
    category: 'mod',
    usage: 'perspective <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    await context.triggerTyping();

    try {
      let msg = '';
      let author = {};
      if (context.message.messageReference) {
        msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
        args.input = msg.content
        author = {
          name: msg.author.username,
          iconUrl: msg.author.avatarUrl + '?size=256',
          url: "https://discord.com/users/" + msg.author.id
        }
        msg = `${codeblock("ansi", [stringwrap(msg.content, 200)])}\n`
      }

      let perspectiveApi = await perspective(context, [args.input])

      return await editOrReply(context, createEmbed("default", context, {
        author,
        description: `${msg}${iconPill("agreements", "Scores")} *${link("https://developers.perspectiveapi.com/s/about-the-api-attributes-and-languages", "What do these mean?", "Check out the detection details.")}* ${codeblock("ansi", formatPerspectiveScores(perspectiveApi.response.body))}`,
        footer: {
          iconUrl: STATICS.perspectiveapi,
          text: `Perspective • ${context.application.name}`
        }
      }))
    } catch (e) {
      await editOrReply(context, createEmbed("error", context, `Something went wrong.`))
      console.log(e)
    }
  }
};