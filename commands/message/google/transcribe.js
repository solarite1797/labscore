const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { googleSpeechRecognitionWithLabels } = require('../../../labscore/api');

const { STATICS } = require('../../../labscore/utils/statics');
const { codeblock, icon } = require('../../../labscore/utils/markdown');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'transcribe',
  aliases: ['tcr'],
  metadata: {
    description: `${icon("reply")} __Replying__ to a voice message when using this command will transcribe the contents of the voice message.`,
    description_short: 'Discord voice message transcription',
    category: 'utils',
    usage: 'transcribe'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    context.triggerTyping();
    if (!context.message.messageReference) return editOrReply(context, createEmbed("warning", context, "You need to reply to a voice message."))
    try {
      let msg;
      try {
        msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
      } catch (e) {
        return editOrReply(context, createEmbed("error", context, "Unable to fetch message."))
      }

      if(!msg.attachments.first()) return editOrReply(context, createEmbed("warning", context, "No voice message found."))
      if(!msg.attachments.first().url.split('?')[0].endsWith('voice-message.ogg')) return editOrReply(context, createEmbed("warning", context, "No voice message found."))
      
      const recog = await googleSpeechRecognitionWithLabels(context, msg.attachments.first().url)

      return editOrReply(context, createEmbed("default", context, {
        description: codeblock("md", [ recog.response.body.transcription_with_speakers ]),
        footer: {
          iconUrl: STATICS.google,
          text: `Google Cloud • Confidence: ${(recog.response.body.confidence* 100).toFixed(1)}% • ${context.application.name}`
        }
      }))
      
    } catch (e) {
      console.log(e)
      if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, createEmbed("warning", context, e.response.body.message))
      return editOrReply(context, createEmbed("error", context, `Unable to transcribe audio (too long?).`))
    }
  },
};