const { imtranslator } = require('#api');
const { IMTRANSLATOR_VOICES } = require('#constants');

const { createEmbed } = require('#utils/embed');
const { icon, highlight } = require('#utils/markdown');

const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = require('detritus-client/lib/constants');

module.exports = {
  description: 'Text to Speech with imtranslator voices',
  name: 'imtranslator',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'voice',
      description: 'TTS Voice to use',
      choices: IMTRANSLATOR_VOICES,
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
      let s = Date.now()
      await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})
      let audio = await imtranslator(context, args.text, args.voice)
      let diff = (Date.now() - s)
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