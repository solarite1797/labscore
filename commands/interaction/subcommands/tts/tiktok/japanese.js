const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = Constants;

const { tiktok } = require('../../../../../labscore/api');

const { createEmbed } = require('../../../../../labscore/utils/embed');
const { icon, highlight } = require('../../../../../labscore/utils/markdown');
const { TIKTOK_VOICES_JAPANESE } = require('../../../../../labscore/constants');

let voices = []
for(const k of Object.keys(TIKTOK_VOICES_JAPANESE)) voices.unshift({
  value: k,
  name: TIKTOK_VOICES_JAPANESE[k]
})

module.exports = {
  description: 'Voices from Japanese TikTok Characters.',
  name: 'japanese',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'text',
      description: 'Text',
      type: ApplicationCommandOptionTypes.STRING,
      required: true
    },
    {
      name: 'voice',
      description: 'Voice to use',
      choices: voices,
      required: true
    }
  ],
  run: async (context, args) => {
    try {
      await context.respond({ data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE })

      if(args.text.length >= 101) return await context.editOrRespond({
        embeds: [createEmbed("warning", context, "Text too long (must be 100 or shorter).")]
      })

      let audio = await tiktok(context, args.text, args.voice)

      await context.editOrRespond({
        embeds: [createEmbed("defaultNoFooter", context, { description: `${icon("audio")} Audio Generated in ${highlight(audio.timings + "s")}.` })],
        file: { value: audio.response.body, filename: "tiktok.mp3" }
      })

    } catch (e) {
      console.log(e)
      await context.editOrRespond({
        embeds: [createEmbed("error", context, "Unable to generate audio file.")]
      })
    }
  },
};