const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandTypes, MessageFlags } = Constants;

const { createEmbed } = require('../../../labscore/utils/embed')

const superagent = require('superagent')
const { renderMusicButtons } = require('../../../labscore/utils/buttons');

const urlr = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g

module.exports = {
  name: 'Music Platforms',
  type: ApplicationCommandTypes.MESSAGE,
  run: async (context, args) => {
    try{
      await context.respond({data: { flags: MessageFlags.EPHEMERAL }, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

      const { message } = args;

      let urls = message.content.match(urlr)
      if(urls){
        try{
          let songlink = await superagent.get(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(urls[0])}`)
          let song = songlink.body.entitiesByUniqueId[songlink.body.entityUniqueId]
  
          let btns = renderMusicButtons(songlink.body.linksByPlatform)
          return context.editOrRespond({embeds:[
            createEmbed("default", context, {
              author: {
                name: `${song.title} by ${song.artistName}`.substr(0,1000),
                iconUrl: song.thumbnailUrl,
                url: urls[0]
              },
              footer: {}
            })
          ], components: btns, flags: MessageFlags.EPHEMERAL })
        }catch(e){
          return context.editOrRespond({ embeds: [createEmbed("warning", context, "No results found.")], flags: MessageFlags.EPHEMERAL })
        }
      } else {
        return context.editOrRespond({ embeds: [createEmbed("warning", context, "No urls found.")], flags: MessageFlags.EPHEMERAL })
      }
    }catch(e){
      console.log(e)
      await context.editOrRespond({
        embeds: [createEmbed("error", context, "Unable to look up song url.")],
        flags: MessageFlags.EPHEMERAL
      })
    }
  },
};