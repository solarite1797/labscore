const { Components } = require("detritus-client/lib/utils");
const { perspective } = require("../../../labscore/api");
const { format } = require("../../../labscore/utils/ansi");
const { createEmbed } = require("../../../labscore/utils/embed");

const { icon, codeblock, iconPill, smallPill } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

const { Permissions } = require("detritus-client/lib/constants");

function getPerspectiveColor(score) {
  if (score >= 0.9) return "m"
  if (score >= 0.76) return "r"
  if (score >= 0.5) return "y"
  return "g"
}

/*
TODO: this entire code is terrible, rework it some day
*/

function renderPerspectiveAnalysis(payload, input, type){
  if(!payload.annotations[type]) throw "unknown type";

  let analysis = payload.annotations[type]

  var offset = 0;
  var final = input;

  for(const a of analysis){
    var length = final.length;
    var before = final.substring(0,a.region[0]+offset - 1);
    var replace = final.substring(a.region[0] - 1 + offset, a.region[1] + offset);
    var after = final.substring(a.region[1]+offset,length);
    final = before + format(replace, getPerspectiveColor(a.score)) + after;
    offset += 10;
  }
  
  return final
}

function perspectiveAnalysisEmbed(context, payload, input, type){
  let score = payload.scores[type];
  return createEmbed("default", context, {
    description: `${iconPill("agreements", `${type.substr(0, 1).toUpperCase()}${type.substr(1, type.length).toLowerCase().replace(/_/g, ' ')}`)} ${smallPill(`${score.toString().substr(2, 2)}.${score.toString().substr(3, 1)}%`)} ${codeblock("ansi", [renderPerspectiveAnalysis(payload,input,type)])}`,
    footer: {
      iconUrl: STATICS.perspectiveapi,
      text: `Perspective • ${context.application.name}`
    }
  })
}

module.exports = {
  label: "input",
  name: "analyze",
  metadata: {
    description: `Analyzes a sentence with Perspective for Toxicity.`,
    description_short: `Analyze sentences with Perspective.`,
    examples: ['analyze I hate otters. They are bad animals.'],
    category: 'mod',
    usage: 'analyze <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    await context.triggerTyping();

    try {
      let msg = '';
      if (context.message.messageReference) {
        msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
        args.input = msg.content
        msg = `${icon("robot")} <@${msg.author.id}> (${msg.author.id})\n${codeblock("ansi", [msg.content])}\n`
      }

      let perspectiveApi = await perspective(context, [args.input])

      let currentView = perspectiveAnalysisEmbed(context, perspectiveApi.response.body, args.input, Object.keys(perspectiveApi.response.body.annotations)[0]);

      const components = new Components({
        timeout: 100000,
        run: async (ctx) => {
          if (ctx.userId !== context.userId) return await ctx.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);
          
          // this sucks but works, ensures the newly selected option stays selected
          for (let i = 0; i < components.components[0].components[0].options.length; i++) {
            components.components[0].components[0].options[i].default = (components.components[0].components[0].options[i].value == ctx.data.values[0])
          }

          currentView = perspectiveAnalysisEmbed(context, perspectiveApi.response.body, args.input, ctx.data.values[0])
          await ctx.editOrRespond({embeds: [currentView], components})
        },
      });

      let selectOptions = Object.keys(perspectiveApi.response.body.annotations).map((r) => {
        return {
          label: `${r.substr(0, 1).toUpperCase()}${r.substr(1, r.length).toLowerCase().replace(/_/g, ' ')}`,
          value: r,
          default: (r == Object.keys(perspectiveApi.response.body.annotations)[0])
        }
      })

      components.addSelectMenu({
        placeholder: "Select filter type",
        customId: "filter-type",
        options: selectOptions
      })

      setTimeout(()=>{
        editOrReply(context, {
          embeds:[currentView],
          components:[]
        })
      }, 100000)

      return await editOrReply(context, {
        embeds: [currentView],
        components
      })
    } catch (e) {
      await editOrReply(context, createEmbed("error", context, `Something went wrong.`))
      console.log(e)
    }
  }
};