const MUSIC_PLATFORMS = {
  "amazonStore": "914614653479428177",
  "amazonMusic": "914624582302982194",
  "deezer": "914614652644761650",
  "appleMusic": "914615427009744927",
  "itunes": "914614654964211722",
  "napster": "914614654595133481",
  "pandora": "914614655115218986",
  "soundcloud": "914614653076791306", 
  "spotify": "914614653122932817", 
  "tidal": "914614653479428176",
  "youtube": "914614653563310130",
  "youtubeMusic": "914614653663989781"
}

module.exports.renderMusicButtons = function(platforms){
  let btns = [];
  for(const k of Object.keys(platforms)){
    let s = platforms[k]
    if(MUSIC_PLATFORMS[k]){
      btns.push(
        {
          custom_id: k.toLowerCase(),
          style: 5,
          url: s.url,
          emoji: { id: MUSIC_PLATFORMS[k]},
          type: 2
        }
      )
    }
  }
  let rows = []
  while(btns.length){
    rows.push(btns.splice(0, 5))
  }
  let components = []
  for(const r of rows){
    components.push(
      {
        components: r,
        type: 1,
      }
    )
  }
  return components
}