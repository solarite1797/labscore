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
    description: '**audio detection**\nusing the audio command without replying to a message will try to identify the song in the most recent video\n\n**music platform links**\n__replying__ to a message while using this command will return a list of music platforms the provided music (link) is available on',
    examples: ['aud'],
    category: 'search',
    usage: 'audio'
  },
  run: async (context) => {
    context.triggerTyping();
    try{

      if(context.message.messageReference){
        let msg;
        try{
          msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
        } catch(e){
          return editOrReply(context, {embeds:[createEmbed("error", context, "Unable to fetch message.")]})
        }
        let urls = msg.content.match(urlr)
        if(urls){
          try{
            let songlink = await superagent.get(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(urls[0])}`)
            let song = songlink.body.entitiesByUniqueId[songlink.body.entityUniqueId]
    
            let btns = renderMusicButtons(songlink.body.linksByPlatform)
            return editOrReply(context, {embeds:[
              createEmbed("default", context, {
                author: {
                  name: `${song.title} by ${song.artistName}`.substr(0,1000),
                  iconUrl: song.thumbnailUrl,
                  url: urls[0]
                },
                footer: {}
              })
            ], components: btns})
          }catch(e){} //ignore it and run the audio detection flow
        }
      }


      let audios = await getRecentVideo(context, 50)
      if(!audios.length) return editOrReply(context, {embeds:[createEmbed("warning", context, `Could not find supported video.`)]})
      let audioSearch = await searchAudio(context, audios[0].url)
      search = audioSearch.response
      if(audioSearch.response.body.status == 0){
        // API lowkey sucks, fetch more metadata via songlink
        let url = audioSearch.response.body.media[Object.keys(audioSearch.response.body.media)[0]]
        if(audioSearch.response.body.media.deezer) url = audioSearch.response.body.media.deezer
        if(audioSearch.response.body.media.spotify) url = audioSearch.response.body.media.spotify
        let songlink = await superagent.get(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url)}`)
        //get song meta
        let song = songlink.body.entitiesByUniqueId[songlink.body.entityUniqueId]

        let btns = renderMusicButtons(songlink.body.linksByPlatform)
        return editOrReply(context, {embeds:[
          createEmbed("default", context, {
            author: {
              name: `${song.title} by ${song.artistName}`.substr(0,1000),
              iconUrl: song.thumbnailUrl,
              url: url
            },
            footer: {}
          })
        ], components: btns})
      }

    }catch(e){
      if(e.response?.body?.status){
        return editOrReply(context, {embeds:[createEmbed("error", context, e.response.body.message)]})
      }
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform audio search.`)]})
    }
  },
};