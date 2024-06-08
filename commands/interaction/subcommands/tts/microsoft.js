const { sapi4 } = require('#api');
const { MICROSOFT_VOICES, MICROSOFT_VOICE_CONFIG } = require('#constants');

const { createEmbed } = require('#utils/embed');
const { icon, highlight } = require('#utils/markdown');

const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = require('detritus-client/lib/constants');

module.exports = {
  description: 'Text to Speech with microsoft voices',
  name: 'microsoft',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'voice',
      description: 'TTS Voice to use',
      choices: MICROSOFT_VOICES,
      required: true,
    },
    {
      name: 'text',
      description: 'Text',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
      maxLength: 256
    }
  ],
  run: async (context, args) => {
    try{
      await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})
      let audio = await sapi4(context, args.text, args.voice, MICROSOFT_VOICE_CONFIG[args.voice].pitch, MICROSOFT_VOICE_CONFIG[args.voice].speed)
      await context.editOrRespond({
        embeds: [createEmbed("defaultNoFooter", context, { description: `${icon("audio")} Audio Generated in ${highlight(audio.timings + "s")}.` })],
        file: { value: audio.response.body, filename: "tts.wav" }
      })
    }catch(e){
      await context.editOrRespond({
        embeds: [createEmbed("error", context, "Unable to generate audio file.")]
      })
    }
  },
};