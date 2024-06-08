const { moonbase } = require('#api');

const { createEmbed } = require('#utils/embed');
const { icon, highlight } = require('#utils/markdown');

const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = require('detritus-client/lib/constants');

module.exports = {
  description: 'Moonbase Alpha text to speech voices',
  name: 'moonbase',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'text',
      description: 'Text',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
      maxLength: 1024
    }
  ],
  run: async (context, args) => {
    try {
      await context.respond({ data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE })

      let audio = await moonbase(context, args.text, args.voice)

      await context.editOrRespond({
        embeds: [createEmbed("defaultNoFooter", context, { description: `${icon("audio")} Audio Generated in ${highlight(audio.timings + "s")}.` })],
        file: { value: audio.response.body, filename: "moonbase.wav" }
      })

    } catch (e) {
      console.log(e)
      await context.editOrRespond({
        embeds: [createEmbed("error", context, "Unable to generate audio file.")]
      })
    }
  },
};