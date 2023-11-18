const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = Constants;

const { REWRITE_STYLES } = require('../../../labscore/constants');

const { createEmbed } = require('../../../labscore/utils/embed');
const { iconPill, codeblock } = require('../../../labscore/utils/markdown');
const { MessageFlags } = require('detritus-client/lib/constants');

const superagent = require('superagent')

module.exports = {
  description: 'Use AI to rewrite your messages.',
  name: 'rewrite',
  guildIds: process.env.TESTING_SERVER_IDS.split(';'),
  options: [
    {
      name: 'message',
      description: 'Message to rewrite',
      type: ApplicationCommandOptionTypes.STRING,
      required: true
    },
    {
      name: 'style',
      description: 'Style to use',
      choices: REWRITE_STYLES,
      required: true
    },
  ],
  run: async (context, args) => {
    
    await context.respond({data: { flags: MessageFlags.EPHEMERAL }, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

    try{
      // Use the last 10 chat messages as context for the rewrite
      let messageContext = [];
      const messages = await context.channel.fetchMessages({limit: 10});

      for(const m of messages){
        if(!m[1].content) continue;
        let ctx = {
          username: m[1].author.username,
          content: m[1].content
        }

        if(m[1].content.length > 200) ctx.content = ctx.content.substr(0, 200) + "..."

        messageContext.push(ctx)
      }

      // Call the custom message rewriting api
      // TODO: move this once monolith/pelican is ready
      let res = await superagent.post(`${process.env.AI_SERVER}/boulevard:rewriteMessage`)
        .set({
          Authorization: process.env.AI_SERVER_KEY
        })
        .send({
          input: args.message,
          style: args.style,
          context: messageContext
        })

      let input = args.message
      if(input.length >= 50) input = input.substr(0, 50) + "..."

      if(!res.body.output) return context.editOrRespond({ embeds: [createEmbed("error", context, "Unable to generate rewrite. Try again later.")], flags: MessageFlags.EPHEMERAL })

      return context.editOrRespond({ embeds: [createEmbed("defaultNoFooter", context, {
        description: `${iconPill("generativeai_text", input)}\n${res.body.output.map((o)=> codeblock("text", [o.replace(/\nRewritten: .*?/gs, '')])).join(' ')}`
      })], flags: MessageFlags.EPHEMERAL })
    }catch(e){
      console.log(e)
      await context.editOrRespond({
        embeds: [createEmbed("error", context, "Unable to generate text. Try again later.")],
        flags: MessageFlags.EPHEMERAL
      })
    }
  },
};