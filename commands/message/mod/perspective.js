const { Constants } = require("detritus-client");
const { perspective } = require("../../../labscore/api");
const { format } = require("../../../labscore/utils/ansi");
const { createEmbed } = require("../../../labscore/utils/embed");
const Permissions = Constants.Permissions;

const { icon, codeblock, iconPill } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");
const { getMember } = require("../../../labscore/utils/users");


function getPerspectiveColor(score){
  if(score >= 0.8) return "r"
  if(score >= 0.3) return "y"
  return "g"
}

function formatPerspectiveScores(data){
  let entries = [];
  let srt = [];

  for(const scr of Object.keys(data.scores)){
    let score = data.scores[scr];
    perc = `${score.toString().substr(2,2)}.${score.toString().substr(3,1)}`
    if(perc.startsWith('0')) perc = ` ${perc.substr(1, perc.length)}`
    srt.push(`${data.scores[scr]}|${format(perc + '%', getPerspectiveColor(score))}   ${scr.substr(0,1).toUpperCase()}${scr.substr(1,scr.length).toLowerCase().replace(/_/g, ' ')}`)
  }
  for(const i of srt.sort().reverse()) entries.push(i.split('|')[1])
  return entries
}

module.exports = {
  label: "input",
  name: "perspective",
  metadata: {
    // description: `Uses PerspectiveAPI to grade the toxicity of a prompt or user.`,
    // description_short: 'Toxicity scores for prompts or users.',
    description: `Uses Perspective to judge the toxicity of a prompt.`,
    description_short: `Toxicity scores for prompts.`,
    examples: ['perspective I hate otters.'],
    category: 'mod',
    // usage: 'perspective <user> OR perspective <prompt>'
    usage: 'perspective <prompt>'
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  permissionsClient: [Permissions.MANAGE_MESSAGES],
  run: async (context, args) => {
    await context.triggerTyping();
    
   try{
    // The per-user scanning is coming soon ;)

    // let u = await getMember(context, args.input)
    //  if(!u){ // Assume its a prompt
      let msg = '';
      if (context.message.messageReference) {
        msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
        args.input = msg.content
        msg = `${icon("robouser")} <@${msg.author.id}> (${msg.author.id})\n${codeblock("ansi", [ msg.content ])}\n`
      }

      let perspectiveApi = await perspective(context, [ args.input ])

      return await editOrReply(context, { embeds: [createEmbed("default", context, {
        description: `${msg}${iconPill("rules", "Scores")} ${codeblock("ansi", formatPerspectiveScores(perspectiveApi.response.body))}`,
        footer: {
          iconUrl: STATICS.perspectiveapi,
          text: `Perspective • ${context.application.name}`
        }
      })] })
    // }

    // let response = await editOrReply(context, { embeds: [createEmbed("loading", context, `Collecting messages...`)] })

    // const messages = await context.message.channel.fetchMessages({limit: args.amount});
    // 
    // await response.edit({ embeds: [createEmbed("loading", context, `Analyzing messages...`)] })
    // 
    // let messageContent = [];

    // for(const m of messages){
    //   // User limit
    //   if(m[1].author.id == u.id && m[1].content.length >= 1) messageContent.push(m[1].content)
    // }

    // console.log(messageContent)
 
    // if(messageContent.length == 0){
    //   return await response.edit({ embeds: [createEmbed("warning", context, `No content found that could be analyzed.`)] })
    // }
 
    // let perspectiveApi = await perspective(context, messageContent)
 
    // return await editOrReply(context, { embeds: [createEmbed("default", context, {
    //   description: `Analyzed ${iconPill("analytics", `${messageContent.length} Messages`)} by <@${u.id}>.\n\n${formatPerspectiveScores(perspectiveApi.response.body).join('\n')}`,
    //   footer: {
    //     iconUrl: STATICS.perspectiveapi,
    //     text: `Perspective • ${context.application.name}`
    //   }
    // })] })
   }catch(e){
    await editOrReply(context, { embeds: [createEmbed("error", context, `Something went wrong.`)] })
    console.log(e)
   }
  }
};