const { Constants } = require("detritus-client");
const { perspective } = require("../../../labscore/api");
const { format } = require("../../../labscore/utils/ansi");
const { createEmbed } = require("../../../labscore/utils/embed");

const { icon, codeblock, iconPill } = require("../../../labscore/utils/markdown");
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
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    await context.triggerTyping();

    try {
      let msg = '';
      if (context.message.messageReference) {
        msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
        args.input = msg.content
        msg = `${icon("robouser")} <@${msg.author.id}> (${msg.author.id})\n${codeblock("ansi", [msg.content])}\n`
      }

      let perspectiveApi = await perspective(context, [args.input])

      return await editOrReply(context, {
        embeds: [createEmbed("default", context, {
          description: `${msg}${iconPill("rules", "Scores")} ${codeblock("ansi", formatPerspectiveScores(perspectiveApi.response.body))}`,
          footer: {
            iconUrl: STATICS.perspectiveapi,
            text: `Perspective • ${context.application.name}`
          }
        })]
      })
    } catch (e) {
      await editOrReply(context, { embeds: [createEmbed("error", context, `Something went wrong.`)] })
      console.log(e)
    }
  }
};