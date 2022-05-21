const { Hosts } = require('../api/endpoints')

const Statics = Object.freeze({
  brands: {
    photofunia: {
      file: "brands/photofunia.png",
      revision: 1
    },
    genius: {
      file: "brands/genius.png",
      revision: 0
    },
    bing: {
      file: "brands/bing.png",
      revision: 0
    },
    google: {
      file: "brands/google.png",
      revision: 0
    }
  }
})

function staticAsset(static){
  return Hosts.statics + `assets/` + static.file + "?r=" + static.revision
}

module.exports.STATICS = Object.freeze({
  photofunia: staticAsset(Statics.brands.photofunia),
  genius: staticAsset(Statics.brands.genius),
  bing: staticAsset(Statics.brands.bing),
  google: staticAsset(Statics.brands.google)
})