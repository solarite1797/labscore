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
      fN.push(`<:UNKNOWN:878298902971965520> ${feat}`)
    }
  }
    
  fN = fN.sort((a, b) => a.normalize().localeCompare(b.normalize()));
  while(fN.length){
    sfN = fN.splice(0, 10)
    let ft = []
    for(const f of sfN){
      ft.push(`${fD[f]} ${f}`)
    }
    featureCards.push({
      name: `​`,
      value: ft.join('\n'),
      inline: true
    })
  }

  return featureCards;
}