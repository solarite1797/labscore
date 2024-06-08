const { playht } = require('#api');
const { PLAYHT_VOICES } = require('#constants');

const { createEmbed } = require('#utils/embed');
const { icon, highlight } = require('#utils/markdown');

const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = require('detritus-client/lib/constants');

module.exports = {
  description: 'Text to Speech with playht voices',
  name: 'playht',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'voice',
      description: 'Voice to use',
      choices: PLAYHT_VOICES,
      required: true,
    },
    {
      name: 'text',
      description: 'Spoken Text',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
      maxLength: 256
    }
  ],
  run: async (context, args) => {
    try{
      await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})
      let audio = await playht(context, args.text, args.voice)

      await context.editOrRespond({
        embeds: [createEmbed("defaultNoFooter", context, { description: `${icon("audio")} Audio Generated in ${highlight(audio.timings + "s")}.` })],
        file: { value: audio.response.body, filename: "tts.mp3" }
      })
    }catch(e){
      console.log(e)
      await context.editOrRespond({
        embeds: [createEmbed("error", context, "Unable to generate audio file.")]
      })
    }
  },
};