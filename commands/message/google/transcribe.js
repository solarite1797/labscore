const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { googleSpeechRecognition } = require('../../../labscore/api');

const { STATICS } = require('../../../labscore/utils/statics');
const { codeblock } = require('../../../labscore/utils/markdown');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'transcribe',
  aliases: ['tcr'],
  metadata: {
    description: '__Replying__ to a voice message when using this command will transcribe the contents of the voice message.',
    description_short: 'Discord voice message transcription',
    category: 'utils',
    usage: 'transcribe'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    context.triggerTyping();
    if (!context.message.messageReference) return editOrReply(context, { embeds: [createEmbed("warning", context, "You need to reply to a voice message.")] })
    try {
      let msg;
      try {
        msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
      } catch (e) {
        return editOrReply(context, { embeds: [createEmbed("error", context, "Unable to fetch message.")] })
      }

      if(!msg.attachments.first()) return editOrReply(context, { embeds: [createEmbed("warning", context, "No voice message found.")] })
      if(!msg.attachments.first().url.endsWith('voice-message.ogg')) return editOrReply(context, { embeds: [createEmbed("warning", context, "No voice message found.")] })
      
      const recog = await googleSpeechRecognition(context, msg.attachments.first().url)

      return editOrReply(context, createEmbed("default", context, {
        description: codeblock("ansi", [ recog.response.body.transcription ]),
        footer: {
          iconUrl: STATICS.google,
          text: `Google Cloud • Confidence: ${(recog.response.body.confidence* 100).toFixed(1)}% • ${context.application.name}`
        }
      }))
      
    } catch (e) {
      console.log(e)
      if(e.response?.body?.status && e.response.body.status == 2) return editOrReply(context, {embeds:[createEmbed("warning", context, e.response.body.message)]})
      return editOrReply(context, { embeds: [createEmbed("error", context, `Unable to transcribe audio.`)] })
    }
  },
};