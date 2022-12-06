const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = Constants;

const { playht } = require('../../../labscore/api');
const { PLAYHT_VOICES } = require('../../../labscore/constants');

const { createEmbed } = require('../../../labscore/utils/embed');
const { icon, highlight } = require('../../../labscore/utils/markdown');

module.exports = {
  description: 'Text to Speech with different voices',
  name: 'tts2',
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