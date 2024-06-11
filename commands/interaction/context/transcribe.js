const { AudioTranscribe } = require('#obelisk');

const { createEmbed } = require('#utils/embed');
const { acknowledge } = require('#utils/interactions');
const { editOrReply } = require('#utils/message');
const { codeblock } = require('#utils/markdown');
const { STATICS } = require('#utils/statics');

const { ApplicationCommandTypes, MessageFlags } = require("detritus-client/lib/constants");
;

module.exports = {
  name: 'Transcribe Voice Message',
  type: ApplicationCommandTypes.MESSAGE,
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  run: async (context, args) => {
    await acknowledge(context);

    try {
      const { message } = args;

      if (!message.attachments.first()) return editOrReply(context, {
        embeds: [createEmbed("warning", context, "No voice message found.")],
        flags: MessageFlags.EPHEMERAL
      })
      if (!message.attachments.first().url.split('?')[0].endsWith('voice-message.ogg')) return editOrReply(context, {
        embeds: [createEmbed("warning", context, "No voice message found.")],
        flags: MessageFlags.EPHEMERAL
      })

      const recog = await AudioTranscribe(context, message.attachments.first().url)

      return editOrReply(context, {
        embeds: [createEmbed("default", context, {
          description: codeblock("md", [recog.response.body.transcript.substr(0, 3900)]),
          footer: {
            iconUrl: STATICS.google,
            text: `Google Speech to Text • ${context.application.name}`
          }
        })],
        flags: MessageFlags.EPHEMERAL
      })

    } catch (e) {
      return editOrReply(context, {
        embeds: [createEmbed("error", context, "Unable to transcribe message.")],
        flags: MessageFlags.EPHEMERAL
      })
    }
  },
};