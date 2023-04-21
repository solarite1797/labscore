const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = Constants;

const { AI_GPT_MODEL_CONFIG } = require("../../../../labscore/constants");
const superagent = require('superagent')

const { createEmbed } = require('../../../../labscore/utils/embed');
const { codeblock } = require('../../../../labscore/utils/markdown');
const { format } = require('../../../../labscore/utils/ansi');

module.exports = {
  description: 'StableLM (Stability AI stablelm-tuned-alpha-7b)',
  name: 'stablelm',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'prompt',
      description: 'Prompt',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
      maxLength: 256
    }
  ],
  run: async (context, args) => {
    const MODEL = "replicate:stability-ai/stablelm-tuned-alpha-7b"
    try{
      let s = Date.now()
      await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

      let res = await superagent.get(`${process.env.AI_SERVER}/gpt`)
        .query({
          model: MODEL,
          prompt: args.prompt
        })

      await context.editOrRespond({
        embeds: [createEmbed("default", context, {
          footer: {
            iconUrl: `https://derpystuff.gitlab.io/webstorage4/v2/assets/icons/ai/ico_ai_${AI_GPT_MODEL_CONFIG[MODEL].icon}.png`,
            text: `${AI_GPT_MODEL_CONFIG[MODEL].name} • ${context.application.name}`,
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