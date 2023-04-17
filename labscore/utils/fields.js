const { GUILD_FEATURES } = require("../constants");

module.exports.guildFeaturesField = function(g){
  let featureCards = []
  let fN = [];
  let fD = {};
  
  for(const feat of g.features.toArray()){
    if(GUILD_FEATURES[feat]){
      let n = feat.replace(/_/g, ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      if(GUILD_FEATURES[feat].name) n = GUILD_FEATURES[feat].name
      
      fN.push(n);
      fD[n] = GUILD_FEATURES[feat].icon;
    } else {
      fN.push(feat);
    }
  }
    
  fN = fN.sort((a, b) => a.normalize().localeCompare(b.normalize()));
  while(fN.length){
    sfN = fN.splice(0, 10)
    let ft = []
    for(const f of sfN){
      let ic = fD[f]
      if(!fD[f]) ic = `<:UNKNOWN:878298902971965520>`
      ft.push(`${ic} ${f.split('_').map((i)=>i.substring(0, 1).toUpperCase() + i.substring(1,i.length).toLowerCase()).join(' ')}`)
    }
    featureCards.push({
      name: `​`,
      value: ft.join('\n'),
      inline: true
    })
  }

  return featureCards;
}