const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { STATIC_ICONS } = require('../../../labscore/utils/statics');

const superagent = require('superagent')
const { iconPill, stringwrap } = require('../../../labscore/utils/markdown')

const { Permissions, InteractionCallbackTypes } = require("detritus-client/lib/constants");
const { Components } = require('detritus-client/lib/utils');
const { bard } = require('../../../labscore/api/obelisk');
const { hasFeature } = require('../../../labscore/utils/testing');

module.exports = {
  name: 'bard',
  label: 'text',
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nChat with <:bard:1163200801871765504> Bard.`,
    description_short: 'Chat with Bard.',
    examples: ['bard How many otter species are there?'],
    category: 'limited',
    usage: 'bard <input>'
  },
  args: [],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.ATTACH_FILES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!await hasFeature(context, "ai/bard")) return;

    context.triggerTyping();
    if(!args.text) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (text).`))

    let input = args.text;

    try{
      await editOrReply(context, createEmbed("ai_custom", context, STATIC_ICONS.ai_bard))

      let res = await bard(context, input)
      res = res.response

      let description = []
      let files = [];
      
      if(!res.body.drafts) return editOrReply(context, createEmbed("error", context, `Bard returned an error. Try again later.`)) 

      if(res.body.drafts[0].length <= 4000) description.push(res.body.drafts[0])
      else {
        files.push({
          filename: `chat.${Date.now().toString(36)}.txt`,
          value: Buffer.from(res.body.drafts[0])
        })
      }

      if(!res.body.drafts || res.body.drafts?.length <= 1) return editOrReply(context, {
        embeds:[createEmbed("defaultNoFooter", context, {
          author: {
            name: stringwrap(args.text, 50, false),
            iconUrl: STATIC_ICONS.ai_bard_idle
          },
          description: description.join('\n'),
          footer: {
            text: `Bard • Generative AI is experimental. Response may be factually wrong or completely made up.`
          }
        })],
        files
      })
      // Draft support
      else {

        let currentView;

        const components = new Components({
          timeout: 100000,
          run: async (ctx) => {
            if (ctx.userId !== context.userId) return await ctx.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);

              // this sucks but works, ensures the newly selected option stays selected
              for (let i = 0; i < components.components[0].components[0].options.length; i++) {
                components.components[0].components[0].options[i].default = (components.components[0].components[0].options[i].value == ctx.data.values[0])
              }
            
              draft = res.body.drafts[parseInt(ctx.data.values[0].replace('draft-', ''))]

              description = []
              files = [];

              if(draft.length <= 4000) description.push(draft)
              else {
                files.push({
                  filename: `chat.${Date.now().toString(36)}.txt`,
                  value: Buffer.from(draft)
                })
              }

              currentView = createEmbed("defaultNoFooter", context, {
                author: {
                  name: stringwrap(args.text, 50, false),
                  iconUrl: STATIC_ICONS.ai_bard_idle
                },
                description: description.join('\n'),
                footer: {
                  text: `Bard • Generative AI is experimental. Response may be factually wrong or completely made up.`
                }
              })
      
              await ctx.editOrRespond({
                embeds:[currentView],
                files,
                components
              })
          }
        })

        let draftOptions = [];
        for (let i = 0; i < res.body.drafts.length; i++) {
          draftOptions.push({
            label: `Draft ${i + 1}: ​ ${stringwrap(res.body.drafts[i], 50, false)}`,
            value: "draft-" + (i),
            default: false
          })
        }
  
        components.addSelectMenu({
          placeholder: "View other drafts",
          customId: "bard-drafts",
          options: draftOptions
        })
  
        setTimeout(()=>{
          editOrReply(context, {
            embeds:[currentView],
            components:[]
          })
        }, 100000)

        currentView = createEmbed("defaultNoFooter", context, {
          author: {
            name: stringwrap(args.text, 50, false),
            iconUrl: STATIC_ICONS.ai_bard_idle
          },
          description: description.join('\n'),
          footer: {
            text: `Bard • Generative AI is experimental. Response may be factually wrong or completely made up.`
          }
        })

        return editOrReply(context, {
          embeds:[currentView],
          files,
          components
        })
      }
    }catch(e){
      if(e.response?.body?.message) return editOrReply(context, createEmbed("warning", context, e.response.body.message))
      
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to generate text.`))
    }
  }
};