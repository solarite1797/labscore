const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = Constants;

const { tiktok } = require('../../../../labscore/api');
const { TIKTOK_VOICES } = require('../../../../labscore/constants');

const { createEmbed } = require('../../../../labscore/utils/embed');
const { icon, highlight } = require('../../../../labscore/utils/markdown');

module.exports = {
  description: 'TikTok text to speech voices',
  name: 'tiktok',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'voice',
      description: 'TTS Voice to use',
      choices: TIKTOK_VOICES,
      required: true,
    },
    {
      name: 'text',
      description: 'Text',
      type: ApplicationCommandOptionTypes.STRING,
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