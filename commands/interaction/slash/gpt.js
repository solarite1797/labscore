const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = Constants;

const { AI_GPT_MODELS, AI_GPT_MODEL_CONFIG } = require("../../../labscore/constants");
const superagent = require('superagent')

const { createEmbed } = require('../../../labscore/utils/embed');
const { icon, highlight, codeblock } = require('../../../labscore/utils/markdown');

module.exports = {
  description: 'Access a wide selection of Large Language Models.',
  name: 'gpt',
  options: [
    {
      name: 'model',
      description: 'LLM to use',
      choices: AI_GPT_MODELS,
      required: true,
    },
    {
      name: 'prompt',
      description: 'Prompt',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
      maxLength: 256
    }
  ],
  run: async (context, args) => {
    try{
      let s = Date.now()
      await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})
      await context.editOrRespond({
        embeds: [createEmbed("loading_ai", context)]
      })
      let res = await superagent.get(`${process.env.AI_SERVER}/gpt`)
        .query({
          model: args.model,
          prompt: args.prompt
        })

      await context.editOrRespond({
        embeds: [createEmbed("default", context, {
          footer: {
            iconUrl: `https://derpystuff.gitlab.io/webstorage4/v2/assets/icons/ai/ico_ai_${AI_GPT_MODEL_CONFIG[args.model].icon}.png`,
            text: `${AI_GPT_MODEL_CONFIG[args.model].name} • ${context.application.name}`,
          },
          description: codeblock("ansi", [res.body.response.substr(0, 1024).replace(/\\n/g,'\n')])
        })]
      })
    }catch(e){
      console.log(e)
      await context.editOrRespond({
        embeds: [createEmbed("error", context, "Unable to generate response. Try again in a bit.")]
      })
    }
  },
};