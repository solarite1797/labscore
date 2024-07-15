const { renderMusicButtons } = require('#utils/buttons');
const { createEmbed } = require('#utils/embed')
const { icon } = require('#utils/markdown');
const { editOrReply } = require('#utils/message')

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

const superagent = require('superagent')

// TODO: make this a constant, or add a URL util
const urlr = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g

module.exports = {
  name: 'audio',
  aliases: ['aud'],
  metadata: {
    description: `${icon("reply")} __Replying__ to a message while using this command will return a list of music streamin platforms the provided song (link) is available on.`,
    description_short: 'Cross-platform music search',
    category: 'search',
    usage: 'audio',
    slashCommand: "Music Platforms"
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    context.triggerTyping();
    if (!context.message.messageReference) return editOrReply(context, createEmbed("warning", context, "You need to reply to a message containing a song link."))
    try {
      let msg;
      try {
        msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
      } catch (e) {
        return editOrReply(context, createEmbed("error", context, "Unable to fetch message."))
      }
      let urls = msg.content.match(urlr)
      if (urls) {
        let songlink = await superagent.get(`https://api.song.link/v1-alpha.1/links`)
          .query({
            url: urls[0],
            key: process.env.SONGLINK_KEY
          })
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
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform song search.`))
    }
  },
};