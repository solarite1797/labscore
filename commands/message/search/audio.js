const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { searchAudio } = require('../../../labscore/api');
const { getRecentVideo } = require('../../../labscore/utils/attachment');
const { renderMusicButtons } = require('../../../labscore/utils/buttons');

const superagent = require('superagent')

const urlr = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g

module.exports = {
  name: 'audio',
  aliases: ['aud'],
  metadata: {
    description: '__Replying__ to a message while using this command will return a list of music streamin platforms the provided song (link) is available on.',
    description_short: 'Cross-platform music search',
    examples: ['aud'],
    category: 'search',
    usage: 'audio'
  },
  run: async (context) => {
    context.triggerTyping();
    if (!context.message.messageReference) return editOrReply(context, { embeds: [createEmbed("warning", context, "You need to reply to a message containing a song link.")] })
    try {
      let msg;
      try {
        msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
      } catch (e) {
        return editOrReply(context, { embeds: [createEmbed("error", context, "Unable to fetch message.")] })
      }
      let urls = msg.content.match(urlr)
      if (urls) {
        let songlink = await superagent.get(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(urls[0])}`)
        let song = songlink.body.entitiesByUniqueId[songlink.body.entityUniqueId]

        let btns = renderMusicButtons(songlink.body.linksByPlatform)
        return editOrReply(context, {
          embeds: [
            createEmbed("default", context, {
              author: {
                name: `${song.title} by ${song.artistName}`.substr(0, 1000),
                iconUrl: song.thumbnailUrl,
                url: urls[0]
              },
              footer: {}
            })
          ], components: btns
        })
      }
    } catch (e) {
      return editOrReply(context, { embeds: [createEmbed("error", context, `Unable to perform song search.`)] })
    }
  },
};