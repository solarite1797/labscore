const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandTypes, MessageFlags } = Constants;

const {  googleSpeechRecognitionWithLabels } = require('../../../labscore/api');

const { createEmbed } = require('../../../labscore/utils/embed');
const { codeblock } = require('../../../labscore/utils/markdown');
const { STATICS } = require('../../../labscore/utils/statics');
const { editOrReply } = require('../../../labscore/utils/message');

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
    await context.respond({data: { flags: MessageFlags.EPHEMERAL }, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

      try {
        const { message } = args;

        if(!message.attachments.first()) return editOrReply(context, {
          embeds: [createEmbed("warning", context, "No voice message found.")],
          flags: MessageFlags.EPHEMERAL
        })
        if(!message.attachments.first().url.split('?')[0].endsWith('voice-message.ogg')) return editOrReply(context, {
          embeds: [createEmbed("warning", context, "No voice message found.")],
          flags: MessageFlags.EPHEMERAL
        })
        
        const recog = await googleSpeechRecognitionWithLabels(context, message.attachments.first().url)
  
        return editOrReply(context, {
          embeds: [createEmbed("default", context, {
            description: codeblock("md", [ recog.response.body.transcription_with_speakers ]),
            footer: {
              iconUrl: STATICS.google,
              text: `Google Cloud • Confidence: ${(recog.response.body.confidence* 100).toFixed(1)}% • ${context.application.name}`
            }
          })],
          flags: MessageFlags.EPHEMERAL
        })
        
      } catch (e) {
        console.log(e)
        if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, {
          embeds: [createEmbed("warning", context, e.response.body.message)],
          flags: MessageFlags.EPHEMERAL
        })

        return editOrReply(context, {
          embeds: [createEmbed("error", context, "Unable to transcribe message.")],
          flags: MessageFlags.EPHEMERAL
        })
      }
  },
};